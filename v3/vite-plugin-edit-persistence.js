// vite-plugin-edit-persistence.js
//
// Dev-server middleware that persists Edit-Tool CSS changes to a single
// well-known source file: `src/styles/dashboard-edits.css`. Approach B
// from #80 architectural decision.
//
// Wire flow:
//   1. Edit Tool in Dashboard.jsx applies a runtime style change AND POSTs
//      `{ selector, property, value }` to `/__edit-save`.
//   2. This middleware merges the rule into `dashboard-edits.css` keyed by
//      `(selector, property)` so the same (selector, property) pair always
//      overwrites prior values rather than accumulating.
//   3. Vite's CSS watcher detects the file change and HMR-pushes the new
//      stylesheet to all open clients (homepage + standalone component
//      previews) — caller sees the change live everywhere.
//
// File format (idempotent, hand-editable, easy to revert):
//
//   ─── dashboard-edits.css ───────────────────────────────────────────────
//   |  Auto-managed by Dashboard Edit Tool.
//   |  <BEGIN-MARKER selector::property>
//   |  selector { property: value; }
//   |  <END-MARKER>
//
// The actual markers in the file use CSS block comments containing `EDIT:`
// + the key — see `blockFor()` for the literal format. We can't render the
// literal markers in this docstring because the file format intentionally
// uses `*/` sequences (the file is CSS, where those terminate CSS comments)
// and writing them here in a JS block comment would close THIS comment
// early. Lesson banked from #77's mirror bug.
//
// The marker comments make each rule individually addressable so:
//   - Saving the same selector+property again rewrites that block in place.
//   - Reverting (value === null) deletes the block.
//   - Manual "promote to component CSS" = copy the rule, delete the block.

import { promises as fs } from 'node:fs';
import path from 'node:path';

const TARGET_FILENAME = 'src/styles/dashboard-edits.css';

const FILE_HEADER = `/* dashboard-edits.css — auto-managed by the v2 Dashboard Edit Tool.
 *
 * Rules in this file were created by clicking elements in the Edit Tool
 * (Dashboard.jsx, Edit mode) and changing properties. Each rule is wrapped
 * in /*EDIT:<key>*\\/ ... /*\\/EDIT*\\/ marker comments so the persistence
 * middleware can find + rewrite a single rule without disturbing others.
 *
 * Cascade: this file is imported LAST in main.jsx so its rules win over
 * component-intrinsic CSS without requiring extra specificity. To "promote"
 * an edit into its component CSS, copy the rule into the component .css
 * file and delete the block here (or just delete to revert).
 *
 * Do not hand-edit unless you know what you're doing — the Edit Tool's
 * round-trip parser expects the exact marker format above. */

`;

/** Build the marker-block string for a given edit. */
function blockFor(selector, property, value) {
  const key = `${selector}::${property}`;
  return `/*EDIT:${key}*/\n${selector} { ${property}: ${value}; }\n/*/EDIT*/\n`;
}

/** Match all marker blocks in the file. Returns array of { key, start, end }. */
function findBlocks(source) {
  const re = /\/\*EDIT:([^*]+)\*\/\n[\s\S]*?\/\*\/EDIT\*\/\n?/g;
  const blocks = [];
  for (const m of source.matchAll(re)) {
    blocks.push({ key: m[1], start: m.index, end: m.index + m[0].length });
  }
  return blocks;
}

/** Read or seed the target file. */
async function readTarget(filePath) {
  try {
    return await fs.readFile(filePath, 'utf8');
  } catch (e) {
    if (e.code === 'ENOENT') return FILE_HEADER;
    throw e;
  }
}

/** Merge an edit into the file content (idempotent on the key). */
function mergeEdit(source, selector, property, value) {
  const key = `${selector}::${property}`;
  const blocks = findBlocks(source);
  const existing = blocks.find(b => b.key === key);

  if (value === null || value === undefined || value === '') {
    // Revert/delete path.
    if (existing) {
      return source.slice(0, existing.start) + source.slice(existing.end);
    }
    return source; // nothing to delete
  }

  const newBlock = blockFor(selector, property, value);
  if (existing) {
    return source.slice(0, existing.start) + newBlock + source.slice(existing.end);
  }
  // Append at end.
  const sep = source.endsWith('\n') ? '' : '\n';
  return source + sep + newBlock;
}

/** Read JSON body from a Node req object. */
function readBody(req) {
  return new Promise((resolve, reject) => {
    let buf = '';
    req.on('data', chunk => { buf += chunk; if (buf.length > 1e5) reject(new Error('body too large')); });
    req.on('end', () => {
      try { resolve(JSON.parse(buf)); }
      catch (e) { reject(e); }
    });
    req.on('error', reject);
  });
}

export default function editPersistencePlugin(opts = {}) {
  const targetFile = opts.targetFile || TARGET_FILENAME;
  return {
    name: 'edit-persistence',
    configureServer(server) {
      const filePath = path.resolve(server.config.root, targetFile);

      server.middlewares.use('/__edit-save', async (req, res, next) => {
        if (req.method !== 'POST') return next();
        try {
          const body = await readBody(req);
          const { selector, property, value } = body;
          if (!selector || !property) {
            res.statusCode = 400;
            res.end(JSON.stringify({ ok: false, error: 'selector + property required' }));
            return;
          }
          const source = await readTarget(filePath);
          const next_ = mergeEdit(source, selector, property, value);
          if (next_ !== source) {
            await fs.writeFile(filePath, next_, 'utf8');
          }
          res.setHeader('content-type', 'application/json');
          res.end(JSON.stringify({ ok: true, selector, property, value, file: targetFile }));
        } catch (e) {
          res.statusCode = 500;
          res.end(JSON.stringify({ ok: false, error: String(e && e.message || e) }));
        }
      });

      // Convenience endpoint: GET /__edit-save/list → returns parsed edits
      server.middlewares.use('/__edit-save/list', async (req, res, next) => {
        if (req.method !== 'GET') return next();
        try {
          const source = await readTarget(filePath);
          const blocks = findBlocks(source).map(b => ({ key: b.key }));
          res.setHeader('content-type', 'application/json');
          res.end(JSON.stringify({ ok: true, edits: blocks }));
        } catch (e) {
          res.statusCode = 500;
          res.end(JSON.stringify({ ok: false, error: String(e && e.message || e) }));
        }
      });
    },
  };
}

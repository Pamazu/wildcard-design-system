import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import editPersistence from './vite-plugin-edit-persistence.js';

// Vite config — React + CSS modules.
// CSS modules: any file ending in `.module.css` is auto-scoped per file
// (class names hashed at build time). Global CSS lives in `src/styles/`
// and is imported once in main.jsx.
//
// editPersistence — POST /__edit-save endpoint that persists Edit-Tool CSS
// changes to `src/styles/dashboard-edits.css`. Vite HMR re-imports that
// file on disk change so every open client (homepage + standalone component
// previews) reflects the edit live. See `vite-plugin-edit-persistence.js`.
export default defineConfig({
  plugins: [react(), tailwindcss(), editPersistence()],
  css: {
    modules: {
      // Hash + readable name in dev for easier debugging.
      generateScopedName: '[name]__[local]__[hash:base64:5]',
    },
  },
  server: {
    // v3 dev server — port 5175. v2 stays on 5173 (must remain stable).
    port: 5175,
    open: false,
    // Allow the dashboard (localhost:8080) to embed Vite-served components
    // in iframes. Also allows the dashboard's edit-mode JS to inspect the
    // iframe DOM for selectors + apply tweaks via postMessage.
    cors: true,
    headers: {
      // Allow iframe embedding from any origin during dev.
      'Access-Control-Allow-Origin': '*',
    },
  },
});

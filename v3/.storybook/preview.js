// Global CSS imported here so every story renders against the same tokens
// + global helpers (deco, btn, wc-bgline) as the live app does.
import '../src/styles/reset.css';
import '../src/styles/tokens.css';
import '../src/styles/btn.css';
import '../src/styles/bg-line.css';
import '../src/styles/global.css';
import '../src/styles/pages-home.css';

/** @type { import('@storybook/react').Preview } */
const preview = {
  parameters: {
    layout: 'fullscreen',
    backgrounds: {
      default: 'cream',
      values: [
        { name: 'cream', value: '#F8EFE2' },
        { name: 'dark', value: '#1B1A17' },
        { name: 'white', value: '#FFFFFF' },
      ],
    },
  },
};

export default preview;

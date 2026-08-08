import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import fs from 'fs';

function copyManifestPlugin() {
  return {
    name: 'copy-manifest',
    closeBundle() {
      const src = resolve(__dirname, 'manifest.json');
      const dest = resolve(__dirname, 'dist/manifest.json');
      if (fs.existsSync(src)) {
        fs.copyFileSync(src, dest);
        console.log('✅ Copied valid manifest.json to dist/manifest.json');
      }
    }
  };
}

export default defineConfig({
  plugins: [react(), copyManifestPlugin()],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        sidepanel: resolve(__dirname, 'index.html'),
        content: resolve(__dirname, 'src/content/contentScript.ts'),
        background: resolve(__dirname, 'src/background/serviceWorker.ts')
      },
      output: {
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === 'content') return 'src/content/contentScript.js';
          if (chunkInfo.name === 'background') return 'src/background/serviceWorker.js';
          return 'assets/[name]-[hash].js';
        }
      }
    }
  }
});

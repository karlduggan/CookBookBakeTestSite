import { defineConfig } from 'astro/config';
import vue from '@astrojs/vue';
import tailwind from '@astrojs/tailwind';
import netlify from '@astrojs/netlify';
import { fileURLToPath } from 'url';

// https://astro.build/config
export default defineConfig({
  output: 'hybrid',
  adapter: netlify(),
  integrations: [
    vue({
      appEntrypoint: './src/entry.client.ts',
      template: {
        compilerOptions: {
          isCustomElement: (tag) => tag.startsWith('lds-')
        }
      }
    }),
    tailwind()
  ],
  server: {
    port: 3000,
    host: true
  },
  build: {
    format: 'directory'
  }
});

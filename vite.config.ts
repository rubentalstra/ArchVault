import { defineConfig } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { nitro } from 'nitro/vite'
import { paraglideVitePlugin } from '@inlang/paraglide-js'

const config = defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [
    nitro({ rollupConfig: { external: [/^@sentry\//] } }),
    paraglideVitePlugin({
      project: './project.inlang',
      outdir: './src/paraglide',
      outputStructure: 'message-modules',
      cookieName: 'ARCHVAULT_LOCALE',
      strategy: ['url', 'cookie', 'preferredLanguage', 'baseLocale'],
      urlPatterns: [
        {
          pattern: '/:path(.*)?',
          localized: [
            ['en', '/en/:path(.*)?'],
            ['nl', '/nl/:path(.*)?'],
          ],
        },
      ],
    }),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
  ],
})

export default config

import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import viteTsConfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'
import netlify from '@netlify/vite-plugin-tanstack-start'
import path from 'node:path'

const isTest = process.env.VITEST === 'true'

const config = defineConfig({
  resolve: {
    // Prevent duplicate React instances during dev/test builds (fixes "Invalid hook call").
    dedupe: ['react', 'react-dom', 'react/jsx-runtime', 'react/jsx-dev-runtime'],
    // On pnpm (especially on Windows), React can be resolved via multiple physical paths.
    // Aliasing forces a single instance for tests.
    alias: {
      react: path.resolve(process.cwd(), 'node_modules/react'),
      'react-dom': path.resolve(process.cwd(), 'node_modules/react-dom'),
    },
    preserveSymlinks: false,
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/__tests__/setup.ts'],
    // Inline React deps so the renderer + components share the same React instance in Vitest.
    server: {
      deps: {
        inline: [
          'react',
          'react-dom',
          'react/jsx-runtime',
          'react/jsx-dev-runtime',
          '@testing-library/react',
          '@testing-library/dom',
        ],
      },
    },
    deps: {
      optimizer: {
        web: {
          include: [
            'react',
            'react-dom',
            'react/jsx-runtime',
            'react/jsx-dev-runtime',
            '@testing-library/react',
            '@testing-library/dom',
          ],
        },
      },
    },
  },
  plugins: [
    ...(isTest ? [] : [devtools(), netlify(), tanstackStart()]),
    // this is the plugin that enables path aliases
    viteTsConfigPaths({
      projects: ['./tsconfig.json'],
    }),
    tailwindcss(),
    viteReact(),
  ],
})

export default config

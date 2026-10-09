import { defineConfig } from '@playwright/test'

const MOCK_PORT = 5299

// O Studio roda em 5199 (porta liberada no CORS do FC) apontando para o mock.
export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  fullyParallel: false,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:5199',
    viewport: { width: 1440, height: 900 },
    acceptDownloads: true,
    launchOptions: process.env.PW_CHROME ? { executablePath: process.env.PW_CHROME } : {},
  },
  webServer: [
    {
      command: `node e2e/mock-fc.mjs`,
      url: `http://127.0.0.1:${MOCK_PORT}/__mock/log`,
      reuseExistingServer: true,
      env: { MOCK_FC_PORT: String(MOCK_PORT) },
    },
    {
      command: 'npx vite --host 127.0.0.1',
      url: 'http://127.0.0.1:5199',
      reuseExistingServer: true,
      env: { VITE_FC_API_URL: `http://127.0.0.1:${MOCK_PORT}` },
    },
  ],
})

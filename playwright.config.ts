import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/browser",
  timeout: 45000,
  expect: { timeout: 15000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [["list"], ["json", { outputFile: "generated-artifacts/browser-results.json" }]],
  outputDir: "generated-artifacts/browser",
  use: {
    baseURL: "http://localhost:80",
    viewport: { width: 390, height: 844 },
    video: { mode: "on", size: { width: 390, height: 844 } },
    screenshot: "only-on-failure",
    trace: "off",
    launchOptions: { ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}), args: ["--no-sandbox"] },
  },
});

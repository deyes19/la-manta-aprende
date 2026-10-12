import { defineConfig } from "@playwright/test";
import { existsSync } from "node:fs";
export default defineConfig({
  testDir: "tests/e2e",
  timeout: 180000,
  workers: 1,
  use: {
    baseURL: "http://localhost:4173",
    headless: true,
    actionTimeout: 15000,
    navigationTimeout: 30000,
    launchOptions: existsSync("/usr/bin/chromium")
      ? { executablePath: "/usr/bin/chromium", args: ["--no-sandbox"] }
      : {},
  },
  webServer: {
    command: "node ../../scripts/serve-dist.mjs",
    url: "http://localhost:4173",
    reuseExistingServer: !process.env.CI,
  },
  reporter: "list",
});

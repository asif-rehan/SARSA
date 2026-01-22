import { defineConfig, devices } from '@playwright/test';
import path from 'path';

const baseURL = 'http://localhost:3000';

export default defineConfig({
  timeout: 30 * 1000,
  testDir: path.join(__dirname, 'e2e'),
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  // Use non-interactive reporter for agents/CI, HTML for local development
  reporter: process.env.CI || process.env.AGENT_MODE ? 'list' : 'html',
  outputDir: 'test-results/',
  
  webServer: {
    command: 'npm run dev',
    url: baseURL,
    timeout: 120 * 1000,
    reuseExistingServer: !process.env.CI,
  },

  use: {
    baseURL,
    // Retry a test if its failing with enabled tracing. This allows you to analyze the DOM, console logs, network traffic etc.
    trace: 'retry-with-trace',
  },

  projects: [
    // Test against desktop browsers.
    {
      name: 'Desktop Chrome',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
    {
      name: 'Desktop Firefox',
      use: {
        ...devices['Desktop Firefox'],
      },
    },
    {
      name: 'Desktop Safari',
      use: {
        ...devices['Desktop Safari'],
      },
    },
    // Test against mobile viewports.
    {
      name: 'Mobile Chrome',
      use: {
        ...devices['Pixel 5'],
      },
    },
    {
      name: 'Mobile Safari',
      use: devices['iPhone 12'],
    },
    // Keep the original chromium project for backward compatibility
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});

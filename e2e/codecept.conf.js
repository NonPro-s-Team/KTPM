exports.config = {
  tests: './tests/*_test.js',
  output: './output',
  helpers: {
    Playwright: {
      browser: 'chromium',
      url: process.env.E2E_BASE_URL || 'http://localhost:5173',
      show: process.env.E2E_SHOW_BROWSER === 'true',
      waitForNavigation: 'networkidle',
      windowSize: '1440x900',
      timeout: 15000,
    },
  },
  include: {
    I: './steps_file.js',
  },
  name: 'green-juice-hub-e2e',
};

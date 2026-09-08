const fs = require('node:fs');

const showBrowser = process.env.E2E_SHOW_BROWSER === 'true';
const windowsBrowserCandidates = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
];
const headedBrowserExecutable = process.env.E2E_BROWSER_EXECUTABLE
  || (showBrowser && process.platform === 'win32'
    ? windowsBrowserCandidates.find(candidate => fs.existsSync(candidate))
    : undefined);

exports.config = {
  tests: './tests/admin_journey_test.js',
  output: '../test-evidence/codeceptjs-admin',
  helpers: {
    AdminSession: { require: './helpers/AdminSession.js' },
    Playwright: {
      browser: 'chromium',
      url: process.env.E2E_BASE_URL || 'http://localhost:5173',
      show: showBrowser,
      ...(headedBrowserExecutable
        ? { chromium: { executablePath: headedBrowserExecutable } }
        : {}),
      waitForNavigation: 'domcontentloaded',
      restart: true,
      windowSize: '1440x900',
      timeout: 15000,
      waitForTimeout: 15000,
    },
  },
  include: {
    I: './steps_file.js',
  },
  name: 'green-juice-hub-admin-e2e',
  plugins: { screenshotOnFail: { enabled: true } },
  mocha: {
    reporterOptions: {
      mochaFile: '../test-evidence/codeceptjs-admin/junit.xml',
      testsuitesTitle: 'Green Juice Hub Admin browser tests',
      toConsole: false,
    },
  },
};

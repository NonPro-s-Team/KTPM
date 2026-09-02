exports.config = {
  tests: './tests/smoke_test.js',
  output: './output',
  helpers: {
    Session: { require: './helpers/Session.js' },
    Playwright: {
      browser: 'chromium',
      url: process.env.E2E_BASE_URL || 'http://127.0.0.1:4173',
      show: process.env.E2E_SHOW_BROWSER === 'true',
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
  name: 'green-juice-hub-e2e',
  plugins: { screenshotOnFail: { enabled: true } },
  mocha: {
    reporterOptions: {
      mochaFile: './output/junit.xml',
      testsuitesTitle: 'Green Juice Hub browser tests',
      toConsole: false,
    },
  },
};

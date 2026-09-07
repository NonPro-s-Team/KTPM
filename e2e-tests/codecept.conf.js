import 'dotenv/config';

/** @type {CodeceptJS.MainConfig} */
export const config = {
  tests: './tests/*_test.js',
  output: './output',
  helpers: {
    Playwright: {
      browser: 'chromium',
      url: 'http://localhost:5173',
      show: true
    },
    REST: {
      endpoint: 'http://localhost:8081/api',
      defaultHeaders: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.TEST_ACCESS_TOKEN}`
      }
    }
  },
  include: {
    I: './steps_file.js'
  },
  noGlobals: true,
  plugins: {},
  name: 'e2e-tests'
}
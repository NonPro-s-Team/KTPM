const { config } = require('./codecept.conf');
exports.config = {
  ...config,
  tests: './tests/checkout_journey_test.js',
  output: './output/checkout-journey',
  helpers: {
    ...config.helpers,
    CheckoutJourney: { require: './helpers/CheckoutJourney.js' },
  },
  mocha: { reporterOptions: {
    mochaFile: './output/checkout-journey/junit.xml',
    testsuitesTitle: 'Checkout journeys - real backend, simulated providers',
    toConsole: false,
  } },
};

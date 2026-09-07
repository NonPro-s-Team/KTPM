const { config } = require('./codecept.conf');
exports.config = { ...config, tests: './tests/checkout_test.js' };

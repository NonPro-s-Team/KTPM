const JUnitReporter = require('mocha-junit-reporter');

// Keep machine-readable JUnit and a concise human-readable console in the same run.
class JUnitConsole extends JUnitReporter {
  constructor(runner, options) {
    super(runner, options);
    runner.on('pass', test => console.log(`  PASS ${test.fullTitle()} (${test.duration}ms)`));
    runner.on('pending', test => console.log(`  SKIP ${test.fullTitle()}`));
    runner.on('fail', (test, error) => console.error(`  FAIL ${test.fullTitle()}\n${error.message}`));
    runner.once('end', () => {
      const { tests, passes, failures, pending, duration } = runner.stats;
      console.log(`Tests: ${tests} | Passed: ${passes} | Failed: ${failures} | Skipped: ${pending} | Duration: ${duration}ms`);
      console.log(`JUnit: ${options.reporterOptions?.mochaFile || './output/junit.xml'} | Screenshots: configured output directory`);
    });
  }
}
module.exports = JUnitConsole;

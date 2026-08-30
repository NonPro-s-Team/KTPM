Feature('Application smoke');

Scenario('Home page is reachable', ({ I }) => {
  I.amOnPage('/');
  I.seeInCurrentUrl('/');
});

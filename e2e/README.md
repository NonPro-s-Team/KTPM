# Green Juice Hub E2E

The suite uses CodeceptJS with the Playwright helper.

## Setup

```powershell
cd e2e
npm install
npx playwright install chromium
```

Start the backend and frontend, then run the smoke suite:

```powershell
npm test
```

Checkout scenarios require a prepared customer account with an address and cart items. Export a valid access token first:

```powershell
$env:E2E_ACCESS_TOKEN = '<customer JWT>'
$env:E2E_BASE_URL = 'http://localhost:5173'
npm run test:checkout
```

Use `npm run test:headed` when collecting Jira evidence. External VNPay, MoMo, SePay and GHN production transactions must not be used by automated tests; run those flows against sandbox services or intercept their APIs.

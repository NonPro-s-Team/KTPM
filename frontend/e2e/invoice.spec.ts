import { test, expect } from '@playwright/test';

test('invoices page loads', async ({ page }) => {
  await page.goto('/invoices');
  // TODO: Add assertions
  await expect(page).toHaveTitle(/RMS/);
});

import { test, expect } from '@playwright/test';

test('contracts page loads', async ({ page }) => {
  await page.goto('/contracts');
  // TODO: Add assertions
  await expect(page).toHaveTitle(/RMS/);
});

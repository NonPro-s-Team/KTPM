import { test, expect } from '@playwright/test';

test('login page loads', async ({ page }) => {
  await page.goto('/login');
  // TODO: Add assertions
  await expect(page).toHaveTitle(/RMS/);
});

import { test, expect } from '@playwright/test';

test('rooms page loads', async ({ page }) => {
  await page.goto('/rooms');
  // TODO: Add assertions
  await expect(page).toHaveTitle(/RMS/);
});

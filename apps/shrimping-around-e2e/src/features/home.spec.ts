import { expect, test } from '@playwright/test';

test('has home', async ({ page }) => {
  await page.goto('/');

  await expect(page.locator('h1')).toHaveText('Welcome to home component');
});

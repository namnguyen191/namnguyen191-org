import { expect, test } from '@playwright/test';

test('has not found', async ({ page }) => {
  await page.goto('/some-random-url');

  await expect(page.locator('span')).toHaveText("The page you're looking for is not found");
});

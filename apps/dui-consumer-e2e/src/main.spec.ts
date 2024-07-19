import { expect, test } from '@playwright/test';

test.describe('Home page test', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dui-e2e');
  });

  test('has carbon table v1', async ({ page }) => {
    await expect(page.locator('[id="table-header"]')).toHaveText('This is a different table');
  });

  test('has carbon table v2', async ({ page }) => {
    await expect(page.locator('[id="table-header"]')).toHaveText('Carbon test table', {
      timeout: 10000,
    });
  });
});

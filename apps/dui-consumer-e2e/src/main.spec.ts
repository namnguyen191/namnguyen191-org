import { expect, test } from '@playwright/test';

test.describe('Home page test', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dui-e2e');
  });

  test.describe('should dynamically change ui', () => {
    test('has carbon table v1', async ({ page }) => {
      await expect(page.locator('[id="table-header"]').first()).toHaveText(
        'This is a different table'
      );
    });

    test('has carbon table v2', async ({ page }) => {
      await expect(page.locator('[id="table-header"]').first()).toHaveText('Carbon test table', {
        timeout: 10000,
      });
    });
  });

  test('should not show no data for table with loading state', async ({ page }) => {
    await expect(page.locator('[id="table-header"]')).toHaveCount(3);
    expect(await page.locator('.no-data').count()).toBe(0);
  });
});

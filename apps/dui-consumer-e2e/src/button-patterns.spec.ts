import { expect, test } from '@playwright/test';

test.describe('Button patterns page test', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dui-e2e/button-patterns');
  });

  test('should display correct text', async ({ page }) => {
    const buttonLocator = page.getByRole('button');
    await expect(buttonLocator).toHaveText('bulbasaur');
  });
});

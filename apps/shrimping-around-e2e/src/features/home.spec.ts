import { expect, test } from '@playwright/test';

test.describe('Home page test', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('has home', async ({ page }) => {
    await expect(page.locator('h1')).toHaveText('Welcome to home component');
  });

  test('has navbar', async ({ page }) => {
    const navBar = page.getByRole('navigation');
    await expect(navBar).toBeVisible();

    await page.goto('/some-other-page');
    await expect(page).toHaveURL('/some-other-page');

    const homeLink = navBar.getByRole('link');
    await expect(homeLink).toBeVisible();
    await homeLink.click();
    await expect(page).toHaveURL('/');
  });
});

import { expect, test } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('https://material.angular.io/components/table/examples');

  const exampleTab = page.locator('.mdc-tab__text-label').filter({ hasText: 'examples' });
  await exampleTab.click();
  await expect(exampleTab).toHaveText('examples');
});

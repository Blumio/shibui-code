import { expect, test } from "@playwright/test";

test("boots shell and supports new tab shortcut", async ({ page }) => {
  await page.goto("/");

  await expect(page.locator(".app-shell")).toBeVisible();

  const tabTitles = page.locator(".tab-title");
  await expect(tabTitles).toHaveCount(1);

  await page.keyboard.press("Control+N");
  await expect(tabTitles).toHaveCount(2);
});

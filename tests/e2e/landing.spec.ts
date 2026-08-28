import { expect, test } from "@playwright/test";

test("landing page renders a usable FINANZZI surface", async ({ page }) => {
  const response = await page.goto("/");
  expect(response?.ok()).toBeTruthy();

  await expect(page.locator("body")).toBeVisible();
  await expect(page.getByRole("link", { name: /finanzzi/i }).first()).toBeVisible();
});

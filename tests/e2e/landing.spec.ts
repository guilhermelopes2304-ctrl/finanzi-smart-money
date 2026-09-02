import { expect, test } from "@playwright/test";

test("landing page renders a usable FINANZZI surface", async ({ page }) => {
  const response = await page.goto("/");
  expect(response?.ok()).toBeTruthy();

  await expect(page.locator("body")).toBeVisible();
  await expect(page.getByRole("link", { name: /finanzzi/i }).first()).toBeVisible();
});

test("existing users can find and use the login entry point on every viewport", async ({ page }) => {
  await page.goto("/");

  const loginLink = page.getByRole("link", { name: /^entrar$/i });
  await expect(loginLink).toBeVisible();

  await loginLink.click();
  await expect(page).toHaveURL(/\/auth\?mode=login/);
});

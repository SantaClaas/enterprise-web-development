import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/times");
});

test("navigates to log time via FAB", async ({ page }) => {
  await page.getByTestId("floating-action-button").click();
  await expect(page).toHaveURL("/times/new");
});

test("shows time entries grouped by day", async ({ page }) => {
  // auth.setup.ts seeds at least 1 entry
  await expect(page.getByTestId("times-day").first()).toBeVisible();
});

test("inline edit flow: open edit, cancel", async ({ page }) => {
  // auth.setup.ts seeds at least 1 entry so the first day card is always present
  const firstDay = page.getByTestId("times-day").first();

  await firstDay.getByTestId("times-edit").click();

  await expect(firstDay.getByTestId("times-save")).toBeVisible();
  await expect(firstDay.getByTestId("times-cancel")).toBeVisible();
  await expect(firstDay.getByTestId("times-edit")).not.toBeVisible();

  await firstDay.getByTestId("times-cancel").click();
  await expect(firstDay.getByTestId("times-edit")).toBeVisible();
  await expect(firstDay.getByTestId("times-save")).not.toBeVisible();
});

test("navigation tabs are visible", async ({ page }) => {
  await expect(page.getByTestId("navigation-times")).toBeVisible();
  await expect(page.getByTestId("navigation-timer")).toBeVisible();
  await expect(page.getByTestId("navigation-projects")).toBeVisible();
  await expect(page.getByTestId("navigation-organizations")).toBeVisible();
});

test("navigation tabs route correctly", async ({ page }) => {
  await page.getByTestId("navigation-timer").click();
  await expect(page).toHaveURL("/timer");

  await page.getByTestId("navigation-projects").click();
  await expect(page).toHaveURL("/projects");

  await page.getByTestId("navigation-organizations").click();
  await expect(page).toHaveURL("/organizations");

  await page.getByTestId("navigation-times").click();
  await expect(page).toHaveURL("/times");
});

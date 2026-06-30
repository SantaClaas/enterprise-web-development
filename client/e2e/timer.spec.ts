import { expect, test } from "@playwright/test";

// Tests share server-side timer state for the same user, so run serially.
test.describe.configure({ mode: "serial" });

test.beforeEach(async ({ page }) => {
  await page.goto("/timer");
});

test("shows the elapsed time display", async ({ page }) => {
  await expect(page.getByTestId("timer-display")).toBeVisible();
});

test("start → pause → resume → discard flow", async ({ page }) => {
  // Start the timer
  await page.getByTestId("timer-start").click();
  await expect(page.getByTestId("timer-pause")).toBeVisible();
  await expect(page.getByTestId("timer-start")).not.toBeVisible();

  // Pause the timer
  await page.getByTestId("timer-pause").click();
  await expect(page.getByTestId("timer-resume")).toBeVisible();
  await expect(page.getByTestId("timer-stop")).toBeVisible();

  // Open stop dialog and discard
  await page.getByTestId("timer-stop").click();
  await expect(page.getByTestId("timer-select-project-dialog")).toBeVisible();
  await page.getByTestId("timer-discard").click();

  // Timer should be reset
  await expect(page.getByTestId("timer-start")).toBeVisible();
  await expect(page.getByTestId("timer-select-project-dialog")).not.toBeVisible();
});

test("start → pause → resume flow", async ({ page }) => {
  await page.getByTestId("timer-start").click();
  await expect(page.getByTestId("timer-pause")).toBeVisible();

  await page.getByTestId("timer-pause").click();
  await expect(page.getByTestId("timer-resume")).toBeVisible();

  await page.getByTestId("timer-resume").click();
  await expect(page.getByTestId("timer-pause")).toBeVisible();

  // Clean up: pause and discard
  await page.getByTestId("timer-pause").click();
  await page.getByTestId("timer-stop").click();
  await page.getByTestId("timer-discard").click();
});

test("FAB reflects timer state", async ({ page }) => {
  const fab = page.getByTestId("floating-action-button");
  await expect(fab).toBeVisible();

  // Start via FAB
  await fab.click();
  await expect(page.getByTestId("timer-pause")).toBeVisible();

  // Pause via FAB
  await fab.click();
  await expect(page.getByTestId("timer-resume")).toBeVisible();

  // Clean up
  await page.getByTestId("timer-stop").click();
  await page.getByTestId("timer-discard").click();
});

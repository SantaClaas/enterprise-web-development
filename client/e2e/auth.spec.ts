import { expect, test } from "@playwright/test";

// Auth tests run without saved auth state
test.use({ storageState: { cookies: [], origins: [] } });

test("redirects unauthenticated users to sign-in", async ({ page }) => {
  await page.goto("/times");
  await expect(page).toHaveURL(/\/sign-in/);
});

test("sign-in shows error for invalid credentials", async ({ page }) => {
  await page.goto("/sign-in");
  await page.getByTestId("sign-in-username").fill("nonexistent-user");
  await page.getByTestId("sign-in-password").fill("wrongpassword");
  await page.getByTestId("sign-in-submit").click();

  await expect(page.getByTestId("sign-in-error")).toBeVisible();
  await expect(page).toHaveURL("/sign-in");
});

test("sign-in navigates to sign-up page", async ({ page }) => {
  await page.goto("/sign-in");
  await page.getByTestId("sign-in-go-sign-up").click();
  await expect(page).toHaveURL("/sign-up");
});

test("sign-up navigates back to sign-in page", async ({ page }) => {
  await page.goto("/sign-up");
  await page.getByTestId("sign-up-go-sign-in").click();
  await expect(page).toHaveURL("/sign-in");
});

test("sign-up shows error for duplicate username", async ({ page }) => {
  await page.goto("/sign-up");
  await page.getByTestId("sign-up-name").fill("Test");
  await page.getByTestId("sign-up-username").fill("pw-test-user");
  await page.getByTestId("sign-up-password").fill("pw-test-password");
  await page.getByTestId("sign-up-submit").click();

  await expect(page.getByTestId("sign-up-error")).toBeVisible();
});

test("sign-out returns to sign-in page", async ({ page, request }) => {
  // Sign in via API then UI to test sign-out
  await request.post("/api/sign-ups", {
    data: { name: "Sign Out Test", username: "pw-signout-user", password: "pw-signout-pw" },
    headers: { "Content-Type": "application/json" },
  });

  await page.goto("/sign-in");
  await page.getByTestId("sign-in-username").fill("pw-signout-user");
  await page.getByTestId("sign-in-password").fill("pw-signout-pw");
  await page.getByTestId("sign-in-submit").click();
  await expect(page).toHaveURL("/times");

  await page.getByTestId("open-settings").click();
  await page.getByTestId("sign-out").click();
  await expect(page).toHaveURL(/\/sign-in/);
});

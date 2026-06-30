import { expect, test } from "@playwright/test";

// Tests share the same user data and depend on ordering, so run serially.
test.describe.configure({ mode: "serial" });

test.beforeEach(async ({ page }) => {
  await page.goto("/organizations");
});

test("shows the organizations list", async ({ page }) => {
  await expect(page.getByTestId("organizations-list")).toBeVisible();
});

test("navigates to create organization via FAB", async ({ page }) => {
  await page.getByTestId("floating-action-button").click();
  await expect(page).toHaveURL("/organizations/new");
});

test("create, edit, and delete an organization", async ({ page }) => {
  const orgName = "E2E Org";

  // Create
  await page.getByTestId("floating-action-button").click();
  await expect(page).toHaveURL("/organizations/new");
  await page.getByLabel(/name/i).fill(orgName);
  await page.getByRole("button", { name: /save|create/i }).click();
  await expect(page).toHaveURL("/organizations");

  const item = page.getByTestId("organization-item").filter({ hasText: orgName });
  await expect(item).toBeVisible();

  // Edit
  await item.getByTestId("organization-edit").click();
  await expect(page).toHaveURL(/\/organizations\/.+\/edit/);
  const updatedName = `${orgName} (edited)`;
  await page.getByLabel(/name/i).fill(updatedName);
  await page.getByRole("button", { name: /save|update/i }).click();
  await expect(page).toHaveURL("/organizations");

  const updatedItem = page.getByTestId("organization-item").filter({ hasText: updatedName });
  await expect(updatedItem).toBeVisible();

  // Delete — leaves exactly 1 organization (the seeded one from auth.setup.ts)
  await updatedItem.getByTestId("organization-delete").click();
  await expect(updatedItem).not.toBeVisible();
});

test("delete button is disabled when only one organization exists", async ({ page }) => {
  // auth.setup.ts seeds 1 organization; the prior test creates then deletes 1, leaving exactly 1.
  await expect(
    page.getByTestId("organization-item").first().getByTestId("organization-delete"),
  ).toBeDisabled();
});

test("navigates to members page", async ({ page }) => {
  const firstItem = page.getByTestId("organization-item").first();
  await expect(firstItem).toBeVisible();
  await firstItem.getByTestId("organization-members").click();
  await expect(page).toHaveURL(/\/organizations\/.+\/members/);
});

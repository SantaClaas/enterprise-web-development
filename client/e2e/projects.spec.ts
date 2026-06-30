import { expect, test } from "@playwright/test";

// Tests share the same user data and depend on ordering, so run serially.
test.describe.configure({ mode: "serial" });

test.beforeEach(async ({ page }) => {
  await page.goto("/projects");
});

test("shows the projects list", async ({ page }) => {
  await expect(page.getByTestId("projects-list")).toBeVisible();
});

test("navigates to create project via FAB", async ({ page }) => {
  await page.getByTestId("floating-action-button").click();
  await expect(page).toHaveURL("/projects/new");
});

test("create, edit, and delete a project", async ({ page }) => {
  const projectName = "E2E Project";

  // Create
  await page.getByTestId("floating-action-button").click();
  await expect(page).toHaveURL("/projects/new");
  await page.getByLabel(/name/i).fill(projectName);
  await page.getByRole("button", { name: /save|create/i }).click();
  await expect(page).toHaveURL("/projects");

  // Verify the new project appears
  const item = page.getByTestId("project-item").filter({ hasText: projectName });
  await expect(item).toBeVisible();

  // Edit
  await item.getByTestId("project-edit").click();
  await expect(page).toHaveURL(/\/projects\/.+\/edit/);
  const updatedName = `${projectName} (edited)`;
  await page.getByLabel(/name/i).fill(updatedName);
  await page.getByRole("button", { name: /save|update/i }).click();
  await expect(page).toHaveURL("/projects");

  // Verify edit
  const updatedItem = page.getByTestId("project-item").filter({ hasText: updatedName });
  await expect(updatedItem).toBeVisible();

  // Delete — leaves exactly 1 project (the seeded one from auth.setup.ts)
  await updatedItem.getByTestId("project-delete").click();
  await expect(updatedItem).not.toBeVisible();
});

test("delete button is disabled when only one project exists", async ({ page }) => {
  // auth.setup.ts seeds 1 project; the prior test creates then deletes 1, leaving exactly 1.
  await expect(page.getByTestId("project-item").first().getByTestId("project-delete")).toBeDisabled();
});

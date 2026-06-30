import { expect, test as setup } from "@playwright/test";

const authFile = "e2e/.auth/user.json";

const username = "pw-test-user";
const password = "pw-test-password";

setup("authenticate", async ({ page, request }) => {
  // Ensure the test user exists; 409 means it already exists — both are fine
  await request.post("/api/sign-ups", {
    data: { name: "Playwright Test User", username, password },
    headers: { "Content-Type": "application/json" },
  });

  await page.goto("/sign-in");
  await page.getByTestId("sign-in-username").fill(username);
  await page.getByTestId("sign-in-password").fill(password);
  await page.getByTestId("sign-in-submit").click();
  await expect(page).toHaveURL("/times");

  // Seed baseline data so tests start from a known state.
  // page.request shares the auth cookies set by the UI sign-in above.
  const userId = await (await page.request.get("/api/users/current/id")).text();

  // Ensure at least 1 organization exists
  let organizations = (await (
    await page.request.get(`/api/users/${userId}/organizations`)
  ).json()) as Array<{ id: string }>;
  if (organizations.length === 0) {
    await page.request.post(`/api/users/${userId}/organizations`, {
      headers: { "Content-Type": "text/plain" },
      data: "E2E Org",
    });
    organizations = (await (
      await page.request.get(`/api/users/${userId}/organizations`)
    ).json()) as typeof organizations;
  }
  const organizationId = organizations[0].id;

  // Ensure at least 1 project exists
  let projects = (await (
    await page.request.get(`/api/users/${userId}/projects`)
  ).json()) as Array<{ id: string }>;
  if (projects.length === 0) {
    await page.request.post(`/api/users/${userId}/organizations/${organizationId}/projects`, {
      data: { name: "E2E Project" },
    });
    projects = (await (
      await page.request.get(`/api/users/${userId}/projects`)
    ).json()) as typeof projects;
  }
  const projectId = projects[0].id;

  // Ensure at least 1 time entry exists so inline edit tests have something to act on
  const timeEntries = (await (
    await page.request.get(`/api/users/${userId}/times?page=0&size=1`)
  ).json()) as Array<unknown>;
  if (timeEntries.length === 0) {
    const today = new Date().toISOString().slice(0, 10);
    await page.request.post(`/api/users/${userId}/projects/${projectId}/times`, {
      data: {
        start: `${today}T09:00:00+00:00`,
        end: `${today}T10:00:00+00:00`,
      },
    });
  }

  await page.context().storageState({ path: authFile });
});

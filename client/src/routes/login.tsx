import { createFileRoute, useNavigate } from "@tanstack/solid-router";

import Body from "../Body";
import { useUserContext } from "../userContext";

export const Route = createFileRoute("/login")({
  component: Login,
});
//   <!--
//   This example requires updating your template:

//   ```
//   <html class="h-full bg-white dark:bg-gray-900">
//   <body class="h-full">
//   ```
// -->

//TODO remove this with sign in and Passkey implementation (see sign-in page)
// Template from Tailwind Plus component
function Login() {
  const navigate = useNavigate();
  const userContext = useUserContext();

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    const formData = new FormData(event.target as HTMLFormElement);
    const username = formData.get("username");
    const password = formData.get("password");

    const value = btoa(`${username}:${password}`);
    const response = await fetch("/api/sign-ins", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${value}`,
      },
    });

    console.debug("Login response", response);

    if (!response.ok) {
      //TODO
      alert("Login failed");
      return;
    }

    // Simple state management for now
    userContext.isSignedIn = true;
    console.debug("Set to signed in state", userContext.isSignedIn);
    await navigate({ to: "/times" });
  }

  return (
    <Body class="dark:bg-gray h-full bg-white">
      <div class="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
        <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <form onSubmit={handleSubmit} class="space-y-6">
            <div>
              <label
                for="username"
                class="block text-sm/6 font-medium text-gray-900 dark:text-gray-100"
              >
                Username
              </label>
              <div class="mt-2">
                <input
                  id="username"
                  type="text"
                  name="username"
                  required
                  autocomplete="username"
                  class="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:placeholder:text-gray-500 dark:focus:outline-indigo-500"
                />
              </div>
            </div>

            <div>
              <div class="flex items-center justify-between">
                <label
                  for="password"
                  class="block text-sm/6 font-medium text-gray-900 dark:text-gray-100"
                >
                  Password
                </label>
              </div>
              <div class="mt-2">
                <input
                  id="password"
                  type="password"
                  name="password"
                  required
                  autocomplete="current-password"
                  class="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:placeholder:text-gray-500 dark:focus:outline-indigo-500"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                class="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:bg-indigo-500 dark:shadow-none dark:hover:bg-indigo-400 dark:focus-visible:outline-indigo-500"
              >
                Sign in
              </button>
            </div>
          </form>
        </div>
      </div>
    </Body>
  );
}

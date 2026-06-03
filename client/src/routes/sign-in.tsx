import { createFileRoute } from "@tanstack/solid-router";

import Body from "../Body";

export const Route = createFileRoute("/sign-in")({
  component: SignIn,
});

function SignIn() {
  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    console.debug("Signing in...");

    const form = event.currentTarget as HTMLFormElement;
    const username = form.namedItem("username")?.value;
    const password = form.namedItem("password")?.value;
    const value = btoa(`${username}:${password}`);
    const response = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${value}`,
      },
    });

    console.debug("Login response", response, await response.json());

    const getUsersResponse = await fetch("/api/users", {
      method: "GET",
    });

    console.debug("Get users response", getUsersResponse, await getUsersResponse.json());
  }
  return (
    <Body class="h-dvh p-4 md:p-6">
      <main class="grid h-full items-end">
        <h1 class="text-center font-serif text-6xl font-black text-purple-900">Welcome</h1>
        <form onSubmit={handleSubmit} class="rounded-3xl p-6 text-base leading-6">
          <label for="username" class="text-label-lg block">
            Username
          </label>
          <input
            type="text"
            id="username"
            name="username"
            autocomplete="username"
            required
            class="text-field mt-1 w-full"
          />

          <label for="password" class="text-label-lg text-on-surface-variant mt-4 block">
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            autocomplete="current-password"
            required
            class="text-field mt-1 w-full"
          />

          <button type="submit" class="button mt-6" data-variant="primary">
            Sign in
          </button>
        </form>
        {/* TODO: Button states styles */}
        {/* <button
            onClick={handleSignIn}
            class="bg-primary text-on-primary mt-6 flex w-full items-center justify-center gap-2 rounded-full px-6 py-4"
          >
            <Icon class="fill-on-primary size-6" name="passkey" />
            <span>Sign in with Passkey</span>
          </button>
          <button class="mt-4 block w-full px-6 py-4 text-purple-700">Register</button> */}
      </main>
    </Body>
  );
}

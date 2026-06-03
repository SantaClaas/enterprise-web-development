import { createFileRoute } from "@tanstack/solid-router";

import Body from "../Body";
import Icon from "../Icon";
import { TextFieldInput, TextFieldLabel, TextFieldLabelText } from "../TextField";

export const Route = createFileRoute("/sign-in")({
  component: SignIn,
});

function SignIn() {
  async function handleSignIn() {
    console.debug("Signing in...");

    const user = "yealch";
    const password = "password";
    const value = btoa(`${user}:${password}`);
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
        <section class="rounded-3xl p-6 text-base leading-6">
          <form>
            <label class="text-field">
              <span>Username</span>
              <input type="text" name="username" autocomplete="username" required />
            </label>
            <label class="text-field mt-4">
              <span>Password</span>
              <input type="password" name="password" autocomplete="current-password" required />
            </label>
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
        </section>
      </main>
    </Body>
  );
}

import { useQueryClient } from "@tanstack/solid-query";
import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/solid-router";
import { createSignal } from "solid-js";

import Body from "../Body";
import { idQuery, type Id as UserId } from "../user";

export const Route = createFileRoute("/sign-up")({
  component: RouteComponent,
  async beforeLoad({ location, context: { queryClient } }) {
    if (await queryClient.fetchQuery(idQuery)) {
      console.debug("User is already signed in, redirecting to home page", location.href);
      throw redirect({
        to: "/",
      });
    }
  },
});

function RouteComponent() {
  const [error, setError] = createSignal<string | undefined>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();

    const form = event.currentTarget as HTMLFormElement;
    const nameInput = form.elements.namedItem("name") as HTMLInputElement;
    const name = nameInput.value;
    const usernameInput = form.elements.namedItem("username") as HTMLInputElement;
    const username = usernameInput.value;
    const passwordInput = form.elements.namedItem("password") as HTMLInputElement;
    const password = passwordInput.value;

    let response;
    try {
      response = await fetch("/api/sign-ups", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          username,
          password,
        }),
      });
    } catch (error) {
      console.error("Sign up error", error);
      setError("An error occurred connecting to the server. Please try again later.");
      return;
    }

    if (response.status === 409) {
      setError("Username is already taken");
      return;
    }

    if (!response.ok) {
      console.error("Sign up error", response.statusText);
      setError("An error occurred during sign up. Please try again later.");
      return;
    }

    // Safe cast because we are parsing the response
    const userId = (await response.text()) as UserId;
    queryClient.setQueryData(idQuery.queryKey, userId);

    // Sign up successful
    console.debug("Sign up successful, redirecting to sign in page");
    navigate({ to: "/times" });
  }

  return (
    <Body class="h-dvh p-6">
      <main class="grid h-full items-end">
        <h1 class="text-primary text-display-lg text-center font-serif">Create an account</h1>
        <form onSubmit={handleSubmit} class="rounded-3xl text-base leading-6">
          <p class="text-error text-body-lg min-h-6 text-center transition empty:opacity-0">
            {error()}
          </p>
          <label for="name" class="text-label-lg text-on-surface-variant block">
            Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            autocomplete="name"
            class="text-field mt-1 w-full"
          />

          <label for="username" class="text-label-lg text-on-surface-variant mt-4 block">
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
            New password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            autocomplete="new-password"
            required
            class="text-field mt-1 w-full"
          />

          {/* TODO loading state */}
          <button type="submit" data-variant="filled" class="button mt-6 w-full">
            Sign up
          </button>
          {/* Do not need to pass redirect as a user that signs up should not have been on the app before to be redirected to where they left off */}
          <Link
            to="/sign-in"
            search={{ redirect: undefined }}
            data-variant="text"
            class="button mt-4 w-full"
          >
            Already have an account? Sign in
          </Link>
        </form>
      </main>
    </Body>
  );
}

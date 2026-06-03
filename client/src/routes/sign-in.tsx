import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/solid-router";
import { createSignal } from "solid-js";

import Body from "../Body";
import { useUserContext } from "../userContext";

export const Route = createFileRoute("/sign-in")({
  component: SignIn,
  validateSearch(search) {
    return {
      redirect:
        typeof search.redirect === "string" && search.redirect ? search.redirect : undefined,
    };
  },
  async beforeLoad({ search }) {
    const userContext = useUserContext();
    if (await userContext.getIsSignedIn) {
      console.debug("User is already signed in, redirecting to home page");
      throw redirect({
        to: search.redirect ?? "/",
      });
    }
  },
});

function SignIn() {
  const [error, setError] = createSignal<string | undefined>();

  const navigate = useNavigate();
  const search = Route.useSearch();
  const userContext = useUserContext();
  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    console.debug("Signing in...");

    const form = event.currentTarget as HTMLFormElement;
    const usernameInput = form.elements.namedItem("username") as HTMLInputElement;
    const username = usernameInput.value;
    const passwordInput = form.elements.namedItem("password") as HTMLInputElement;
    const password = passwordInput.value;
    const value = btoa(`${username}:${password}`);
    let response;
    try {
      response = await fetch("/api/sign-ins", {
        method: "POST",
        headers: {
          Authorization: `Basic ${value}`,
        },
      });
    } catch (error) {
      console.error("Login error", error);
      setError("An error occurred connecting to the server. Please try again later.");
      return;
    }

    if (response.status === 403) {
      setError("Invalid username or password");
      return;
    }

    if (!response.ok) {
      console.error("Login failed", response);
      setError("An error occurred signing in. Please try again.");
      return;
    }

    userContext.setIsSignedIn(true);

    const redirect = search().redirect;

    console.debug("Login successful, redirecting to", redirect ?? "/");
    await navigate({ to: redirect ?? "/" });
  }

  return (
    <Body class="h-dvh p-6">
      <main class="grid h-full items-end">
        <h1 class="text-primary text-display-lg text-center font-serif">Welcome</h1>
        <form onSubmit={handleSubmit} class="rounded-3xl text-base leading-6">
          <p class="text-error text-body-lg min-h-6 text-center transition empty:opacity-0">
            {error()}
          </p>
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

          {/* TODO loading state */}
          <button type="submit" data-variant="primary" class="button mt-6 w-full">
            Sign in
          </button>
          <Link to="/register" data-variant="text" class="button mt-4 w-full">
            Register
          </Link>
        </form>
      </main>
    </Body>
  );
}

import { createRootRoute, redirect } from "@tanstack/solid-router";

import { useUserContext } from "../userContext";

export const Route = createRootRoute({
  beforeLoad({ location }) {
    if (location.pathname === "/login") return;

    const context = useUserContext();
    console.debug("Checking if user is signed in", context.isSignedIn);
    if (context.isSignedIn) return;

    console.debug("User is not signed in, redirecting to login page");
    // Throwing an error will stop any children from attempting to load
    throw redirect({
      to: "/login",
      search: {
        redirect: location.href,
      },
    });
  },
});

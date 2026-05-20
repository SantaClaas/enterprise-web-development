import { createRootRoute, redirect } from "@tanstack/solid-router";

import { useUserContext } from "../userContext";

export const Route = createRootRoute({
  beforeLoad({ location }) {
    const context = useUserContext();
    if (context.isSignedIn) return;

    console.debug("User is not signed in, redirecting to login page");
    throw redirect({
      to: "/login",
      search: {
        redirect: location.href,
      },
    });
  },
});

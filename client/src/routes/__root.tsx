import { createRootRoute, redirect } from "@tanstack/solid-router";

import { useUserContext } from "../userContext";

const SIGN_IN = "/sign-in";
const SIGN_UP = "/sign-up";
export const Route = createRootRoute({
  async beforeLoad({ location }) {
    if (location.pathname === SIGN_IN || location.pathname === SIGN_UP) return;

    const context = useUserContext();
    if (await context.getUserId) return;

    console.debug("User is not signed in, redirecting to login page", location.href);
    const search = { redirect: location.href === "/" ? undefined : location.href };
    // Throwing will stop any children from attempting to load and is the recommended way to redirect in a beforeLoad
    throw redirect({
      to: SIGN_IN,
      search,
    });
  },
});

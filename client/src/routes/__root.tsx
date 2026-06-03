import { createRootRoute, redirect } from "@tanstack/solid-router";

import { useUserContext } from "../userContext";

async function getUser() {
  const response = await fetch("/api/user");
  console.debug("User response", response);
}

const SIGN_IN = "/sign-in";
const REGISTER = "/register";
export const Route = createRootRoute({
  beforeLoad({ location }) {
    getUser();
    if (location.pathname === SIGN_IN || location.pathname === REGISTER) return;

    const context = useUserContext();
    console.debug("Checking if user is signed in", context.isSignedIn);
    if (context.isSignedIn) return;

    console.debug("User is not signed in, redirecting to login page", location.href);
    const search = { redirect: location.href === "/" ? undefined : location.href };
    // Throwing will stop any children from attempting to load and is the recommended way to redirect in a beforeLoad
    throw redirect({
      to: SIGN_IN,
      search,
    });
  },
});

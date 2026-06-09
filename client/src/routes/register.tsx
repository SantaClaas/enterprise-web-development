import { createFileRoute, redirect } from "@tanstack/solid-router";

import { useUserContext } from "../userContext";

export const Route = createFileRoute("/register")({
  component: RouteComponent,
  async beforeLoad({ location }) {
    const context = useUserContext();
    if (await context.getUserId) {
      console.debug("User is already signed in, redirecting to home page", location.href);
      throw redirect({
        to: "/",
      });
    }
  },
});

function RouteComponent() {
  return <div>Hello "/register"!</div>;
}

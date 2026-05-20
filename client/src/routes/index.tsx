import { createFileRoute, Navigate } from "@tanstack/solid-router";

import { useUserContext } from "../userContext";

export const Route = createFileRoute("/")({
  component() {
    const userContext = useUserContext();

    // TODO remove when tanstack router global redirect is implemented
    if (userContext.isSignedIn) {
      return <Navigate to="/times" />;
    }

    return <Navigate to="/login" />;
  },
});

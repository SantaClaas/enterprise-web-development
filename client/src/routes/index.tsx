import { createFileRoute, Navigate } from "@tanstack/solid-router";
import { useContext } from "solid-js";

import UserContext from "../userContext";

export const Route = createFileRoute("/")({
  component() {
    const userContext = useContext(UserContext);

    if (userContext.isSignedIn) {
      return <Navigate to="/times" />;
    }

    return <Navigate to="/login" />;
  },
});

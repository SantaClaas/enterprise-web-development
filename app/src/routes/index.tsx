import { createFileRoute, Navigate } from "@tanstack/solid-router";

export const Route = createFileRoute("/")({
  component() {
    return <Navigate to="/times" />;
  },
});

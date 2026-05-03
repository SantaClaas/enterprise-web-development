import { createFileRoute } from "@tanstack/solid-router";

export const Route = createFileRoute("/_app/organizations")({
  component: Organizations,
});

function Organizations() {
  return <main class="bg-slate-50"></main>;
}

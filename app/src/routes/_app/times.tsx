import { createFileRoute } from "@tanstack/solid-router";

export const Route = createFileRoute("/_app/times")({
  component: Times,
});

function Times() {
  return <main class="bg-slate-50"></main>;
}

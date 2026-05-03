import { createFileRoute } from "@tanstack/solid-router";

export const Route = createFileRoute("/_app/projects")({
  component: Projects,
});

function Projects() {
  return <main class="bg-slate-50"></main>;
}

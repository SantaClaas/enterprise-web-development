import { createFileRoute } from "@tanstack/solid-router";

import { Title } from "../../Title";

export const Route = createFileRoute("/_app/projects")({
  component: Projects,
});

function Projects() {
  return (
    <>
      <Title>Projects</Title>
      <main class="bg-slate-50"></main>
    </>
  );
}

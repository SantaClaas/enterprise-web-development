import { createFileRoute, Link } from "@tanstack/solid-router";
import { For, type VoidProps } from "solid-js";

import Icon from "../../Icon";
import { Title } from "../../Title";
import { useProjects, type Project } from "../../useProjects";

export const Route = createFileRoute("/_app/projects")({
  component: Projects,
});

function Card(properties: VoidProps<{ project: Project }>) {
  return <li class="bg-surface-container rounded-large block p-4">{properties.project.name}</li>;
}

function Projects() {
  const projects = useProjects();

  return (
    <>
      <Link to="/projects/new" class="floating-action-button bottom-22">
        <span class="sr-only">Create project</span>
        <Icon name="add" class="fill-on-primary size-6" />
      </Link>
      <Title title="Projects" />
      <main>
        <main class="text-title-lg px-6">
          <ul class="mt-6 flex flex-col gap-4">
            <For each={projects()} fallback={<p>Loading projects...</p>}>
              {(project) => <Card project={project} />}
            </For>
          </ul>
        </main>
      </main>
    </>
  );
}

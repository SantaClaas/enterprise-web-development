import { createFileRoute } from "@tanstack/solid-router";
import { createResource, For, type VoidProps } from "solid-js";

import type { ProjectId } from "../../branded";
import { Title } from "../../Title";
import { useUserContext } from "../../userContext";

export const Route = createFileRoute("/_app/projects")({
  component: Projects,
});

type Project = { id: ProjectId; name: string };

function Card(properties: VoidProps<{ project: Project }>) {
  return <li class="bg-surface-container rounded-large block p-4">{properties.project.name}</li>;
}

function Projects() {
  const userContext = useUserContext();

  const [projects] = createResource(async () => {
    const userId = await userContext.getUserId;

    const response = await fetch(`/api/users/${userId}/projects`, {
      method: "GET",
    });

    if (!response.ok)
      throw new Error(`Error fetching projects: ${response.status} ${await response.text()}`);

    return (await response.json()) as Project[];
  });

  return (
    <>
      <Title title="Projects" />
      <main class="bg-slate-50">
        <main class="text-title-lg px-6">
          <ul>
            <For each={projects()} fallback={<p>Loading projects...</p>}>
              {(project) => <Card project={project} />}
            </For>
          </ul>
        </main>
      </main>
    </>
  );
}

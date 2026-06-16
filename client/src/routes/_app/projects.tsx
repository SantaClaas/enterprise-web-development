import { useMutation, useQuery, useQueryClient } from "@tanstack/solid-query";
import { createFileRoute, Link } from "@tanstack/solid-router";
import { For, Show, type VoidProps } from "solid-js";

import Icon from "../../Icon";
import { deleteProject, isProject, query, type Id as ProjectId, type Project } from "../../project";
import { Title } from "../../Title";
import { idQuery } from "../../user";

export const Route = createFileRoute("/_app/projects")({
  component: Projects,
  async loader({ context: { queryClient }, abortController }) {
    const userId = await queryClient.ensureQueryData(idQuery);
    const projects = await queryClient.ensureQueryData(query(userId, abortController.signal));

    return { projects, userId };
  },
});

function Card(properties: VoidProps<{ project: Project }>) {
  return <li class="bg-surface-container rounded-large block p-4">{properties.project.name}</li>;
}

function Projects() {
  const routeData = Route.useLoaderData();
  const userId = () => routeData().userId;

  const options = () => query(userId());
  const projectsQuery = useQuery(options);
  const queryClient = useQueryClient();

  const deleteMutation = useMutation(() => {
    const currentUserId = userId();
    const queryKey = ["user", currentUserId, "projects"];

    return {
      mutationFn: deleteProject,
      async onSettled() {
        await queryClient.invalidateQueries({ queryKey });
      },
    };
  });

  const isDeleting = (id: ProjectId) => deleteMutation.isPending && deleteMutation.variables === id;

  const isLastProject = () =>
    projectsQuery.status === "success" && projectsQuery.data?.length === 1;

  return (
    <>
      <Title title="Projects" />
      <Link to="/projects/new" class="floating-action-button bottom-22">
        <span class="sr-only">Create project</span>
        <Icon name="add" class="fill-on-primary size-6" />
      </Link>
      {/* TODO overflow, pagination, scrolling */}
      <main class="text-title-lg px-6">
        <ul class="grid grid-cols-[1fr_auto_auto_auto] gap-y-4">
          <For each={projectsQuery.data} fallback={<p>Loading projects...</p>}>
            {(project) => {
              return (
                <Show when={!isProject(project) || !isDeleting(project.id)}>
                  <li class="bg-surface-container rounded-large col-span-full grid grid-cols-subgrid items-center p-4">
                    <span class="ps-3">{project.name}</span>

                    <Show when={isProject(project) && project.id}>
                      {(id) => (
                        <>
                          <Link
                            to="/projects/$id/edit"
                            params={{ id: id() }}
                            search={{ name: project.name, organizationId: project.organization.id }}
                            data-variant="standard"
                            class="icon-button"
                          >
                            <span class="sr-only">Edit</span>
                            <Icon name="edit" class="fill-on-surface size-6" />
                          </Link>
                          <button
                            disabled={isLastProject()}
                            onClick={() => deleteMutation.mutate(id())}
                            data-variant="standard"
                            class="icon-button"
                          >
                            <span class="sr-only">Delete</span>
                            <Icon name="close" class="fill-on-surface size-6" />
                          </button>
                        </>
                      )}
                    </Show>
                  </li>
                </Show>
              );
            }}
          </For>
        </ul>
      </main>
    </>
  );
}

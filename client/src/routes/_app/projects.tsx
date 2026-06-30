import { useMutation, useQuery, useQueryClient } from "@tanstack/solid-query";
import { createFileRoute, Link } from "@tanstack/solid-router";
import { For, Show } from "solid-js";

import { FloatingActionButton } from "../../FloatingActionButton";
import Icon from "../../Icon";
import { useI18n } from "../../i18n";
import { deleteProject, isProject, query, type Id as ProjectId } from "../../project";
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

function Projects() {
  const routeData = Route.useLoaderData();
  const userId = () => routeData().userId;
  const { t } = useI18n();

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
      <Title title={t("projects-title")} />
      <FloatingActionButton to="/projects/new" label={t("projects-create")} icon="add" />
      <main class="overflow-y-auto px-6 py-4 text-title-lg">
        <ul class="grid grid-cols-[1fr_auto_auto_auto] gap-y-4">
          <For each={projectsQuery.data} fallback={<p>{t("projects-loading")}</p>}>
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
                            <span class="sr-only">{t("projects-edit")}</span>
                            <Icon name="edit" class="fill-on-surface size-6" />
                          </Link>
                          <button
                            disabled={isLastProject()}
                            onClick={() => deleteMutation.mutate(id())}
                            data-variant="standard"
                            class="icon-button"
                          >
                            <span class="sr-only">{t("projects-delete")}</span>
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


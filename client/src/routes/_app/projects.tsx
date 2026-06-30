import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/solid-query";
import { createFileRoute, Link } from "@tanstack/solid-router";
import { For, onCleanup, onMount, Show } from "solid-js";

import { FloatingActionButton } from "../../FloatingActionButton";
import Icon from "../../Icon";
import { useI18n } from "../../i18n";
import { deleteProject, isProject, pagedQuery, type Id as ProjectId } from "../../project";
import { Title } from "../../Title";
import { idQuery } from "../../user";

export const Route = createFileRoute("/_app/projects")({
  component: Projects,
  async loader({ context: { queryClient } }) {
    const userId = await queryClient.ensureQueryData(idQuery);
    await queryClient.prefetchInfiniteQuery({ ...pagedQuery(userId), pages: 1 });
    return { userId };
  },
});

function Projects() {
  const routeData = Route.useLoaderData();
  const userId = () => routeData().userId;
  const { t } = useI18n();

  const projectsQuery = useInfiniteQuery(() => pagedQuery(userId()));
  const allProjects = () => projectsQuery.data?.pages.flat() ?? [];

  const queryClient = useQueryClient();

  const deleteMutation = useMutation(() => {
    const currentUserId = userId();
    const queryKey = pagedQuery(currentUserId).queryKey;

    return {
      mutationFn: deleteProject,
      async onSettled() {
        await queryClient.invalidateQueries({ queryKey });
      },
    };
  });

  const isDeleting = (id: ProjectId) => deleteMutation.isPending && deleteMutation.variables === id;

  const isLastProject = () => allProjects().length === 1;

  let sentinel!: HTMLDivElement;
  onMount(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (
          entry.isIntersecting &&
          projectsQuery.hasNextPage &&
          !projectsQuery.isFetchingNextPage
        ) {
          void projectsQuery.fetchNextPage();
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(sentinel);
    onCleanup(() => observer.disconnect());
  });

  return (
    <>
      <Title title={t("projects-title")} />
      <FloatingActionButton to="/projects/new" label={t("projects-create")} icon="add" />
      <main class="overflow-y-auto px-6 py-4 text-title-lg">
        <ul class="grid grid-cols-[1fr_auto_auto_auto] gap-y-4">
          <For each={allProjects()} fallback={<p>{t("projects-loading")}</p>}>
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
        <div ref={sentinel} />
        <Show when={projectsQuery.isFetchingNextPage}>
          <p class="text-on-surface-variant py-4 text-center">{t("projects-loading-more")}</p>
        </Show>
      </main>
    </>
  );
}

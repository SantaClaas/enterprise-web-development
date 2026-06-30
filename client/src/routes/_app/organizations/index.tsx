import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/solid-query";
import { createFileRoute, Link } from "@tanstack/solid-router";
import { For, onCleanup, onMount, Show } from "solid-js";

import { FloatingActionButton } from "../../../FloatingActionButton";
import Icon from "../../../Icon";
import { useI18n } from "../../../i18n";
import {
  deleteOrganization,
  isOrganization,
  pagedQuery,
  type Id as OrganizationId,
} from "../../../organization";
import { Title } from "../../../Title";
import { idQuery } from "../../../user";

export const Route = createFileRoute("/_app/organizations/")({
  component: Organizations,
  async loader({ context: { queryClient } }) {
    const userId = await queryClient.ensureQueryData(idQuery);
    await queryClient.prefetchInfiniteQuery({ ...pagedQuery(userId), pages: 1 });
    return { userId };
  },
});

function Organizations() {
  const routeData = Route.useLoaderData();
  const userId = () => routeData().userId;
  const { t } = useI18n();

  const organizationsQuery = useInfiniteQuery(() => pagedQuery(userId()));
  const allOrganizations = () => organizationsQuery.data?.pages.flat() ?? [];

  const queryClient = useQueryClient();
  const deleteMutation = useMutation(() => {
    const currentUserId = userId();
    const queryKey = pagedQuery(currentUserId).queryKey;

    return {
      mutationFn: deleteOrganization,
      async onSettled() {
        await queryClient.invalidateQueries({ queryKey });
      },
    };
  });

  const isDeleting = (id: OrganizationId) =>
    deleteMutation.isPending && deleteMutation.variables === id;

  const isLastOrganization = () => allOrganizations().length === 1;

  let sentinel!: HTMLDivElement;
  onMount(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (
          entry.isIntersecting &&
          organizationsQuery.hasNextPage &&
          !organizationsQuery.isFetchingNextPage
        ) {
          void organizationsQuery.fetchNextPage();
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(sentinel);
    onCleanup(() => observer.disconnect());
  });

  return (
    <>
      <Title title={t("organizations-title")} />
      <FloatingActionButton
        to="/organizations/new"
        label={t("organizations-create")}
        icon="add"
      />
      <main class="overflow-y-auto px-6 py-4 text-title-lg">
        <ul class="grid grid-cols-[1fr_auto_auto_auto] gap-y-4">
          <For each={allOrganizations()} fallback={<p>{t("organizations-loading")}</p>}>
            {(organization) => {
              return (
                <Show when={!isOrganization(organization) || !isDeleting(organization.id)}>
                  <li class="bg-surface-container rounded-large col-span-full grid grid-cols-subgrid items-center p-4">
                    <span class="ps-3">{organization.name}</span>

                    <Show when={isOrganization(organization) && organization.id}>
                      {(id) => (
                        <>
                          <Link
                            to="/organizations/$id/members"
                            params={{ id: id() }}
                            data-variant="standard"
                            class="icon-button"
                          >
                            <span class="sr-only">{t("organizations-open")}</span>
                            <Icon name="open-in-new-window" class="fill-on-surface size-6" />
                          </Link>

                          <Link
                            to="/organizations/$id/edit"
                            params={{ id: id() }}
                            search={{ name: organization.name }}
                            data-variant="standard"
                            class="icon-button"
                          >
                            <span class="sr-only">{t("organizations-edit")}</span>
                            <Icon name="edit" class="fill-on-surface size-6" />
                          </Link>
                          <button
                            disabled={isLastOrganization()}
                            onClick={() => deleteMutation.mutate(id())}
                            data-variant="standard"
                            class="icon-button"
                          >
                            <span class="sr-only">{t("organizations-delete")}</span>
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
        <Show when={organizationsQuery.isFetchingNextPage}>
          <p class="text-on-surface-variant py-4 text-center">{t("organizations-loading-more")}</p>
        </Show>
      </main>
    </>
  );
}

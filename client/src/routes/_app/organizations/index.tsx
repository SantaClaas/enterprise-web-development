import { useMutation, useQuery, useQueryClient } from "@tanstack/solid-query";
import { createFileRoute, Link } from "@tanstack/solid-router";
import { For, Show } from "solid-js";

import Icon from "../../../Icon";
import {
  deleteOrganization,
  isOrganization,
  query,
  type Id as OrganizationId,
} from "../../../organization";
import { Title } from "../../../Title";
import { idQuery } from "../../../user";

export const Route = createFileRoute("/_app/organizations/")({
  component: Organizations,
  async loader({ context: { queryClient }, abortController }) {
    const userId = await queryClient.ensureQueryData(idQuery);
    const organizations = await queryClient.ensureQueryData(query(userId, abortController.signal));

    return { organizations, userId };
  },
});

function Organizations() {
  const routeData = Route.useLoaderData();
  const userId = () => routeData().userId;

  const options = () => query(userId());
  const organizationsQuery = useQuery(options);

  const queryClient = useQueryClient();
  const deleteMutation = useMutation(() => {
    const currentUserId = userId();
    const queryKey = ["user", currentUserId, "organizations"];

    return {
      mutationFn: deleteOrganization,
      async onSettled() {
        await queryClient.invalidateQueries({ queryKey });
      },
    };
  });

  const isDeleting = (id: OrganizationId) =>
    deleteMutation.isPending && deleteMutation.variables === id;

  const isLastOrganization = () =>
    organizationsQuery.status === "success" && organizationsQuery.data?.length === 1;

  return (
    <>
      <Title title="Organizations" />
      <Link to="/organizations/new" class="floating-action-button bottom-22">
        <span class="sr-only">Create organization</span>
        <Icon name="add" class="fill-on-primary size-6" />
      </Link>
      {/* TODO overflow, pagination, scrolling */}
      <main class="text-title-lg px-6">
        <ul class="grid grid-cols-[1fr_auto_auto_auto] gap-y-4">
          <For each={organizationsQuery.data} fallback={<p>Loading organizations...</p>}>
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
                            <span class="sr-only">Open</span>
                            <Icon name="open-in-new-window" class="fill-on-surface size-6" />
                          </Link>

                          <Link
                            to="/organizations/$id/edit"
                            params={{ id: id() }}
                            search={{ name: organization.name }}
                            data-variant="standard"
                            class="icon-button"
                          >
                            <span class="sr-only">Edit</span>
                            <Icon name="edit" class="fill-on-surface size-6" />
                          </Link>
                          <button
                            disabled={isLastOrganization()}
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

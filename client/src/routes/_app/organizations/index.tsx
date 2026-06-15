import { useMutation, useQueryClient } from "@tanstack/solid-query";
import { createFileRoute, Link } from "@tanstack/solid-router";
import { For, Show, type VoidProps } from "solid-js";

import Icon from "../../../Icon";
import {
  query,
  type OptimisticOrganization,
  type Organization,
  type Id as OrganizationId,
} from "../../../organization";
import { Title } from "../../../Title";
import { idQuery } from "../../../user";
import { Route as MembersRoute } from "../../organizations/$id/members";

export const Route = createFileRoute("/_app/organizations/")({
  component: Organizations,
  async loader({ context: { queryClient } }) {
    const userId = await queryClient.ensureQueryData(idQuery);
    const organizations = await queryClient.ensureQueryData(query(userId));

    return { organizations, userId };
  },
});

function Organizations() {
  const data = Route.useLoaderData();

  const queryClient = useQueryClient();
  const deleteMutation = useMutation(() => ({
    async mutationFn(organizationId: OrganizationId) {
      const response = await fetch(`/api/organizations/${organizationId}`, {
        method: "DELETE",
      });

      if (!response.ok)
        throw new Error("Failed to delete organization. See network response for more details.");
    },

    onSettled() {
      queryClient.invalidateQueries({ queryKey: [query(data().userId).queryKey] });
    },
  }));

  const isDeleting = (id: OrganizationId) =>
    deleteMutation.isPending && deleteMutation.variables === id;

  const isLastOrganization = () => data().organizations.length === 1;

  const isOrganization = (
    organization: Organization | OptimisticOrganization,
  ): organization is Organization => "id" in organization;

  return (
    <>
      <Title title="Organizations" />
      <Link to="/organizations/new" class="floating-action-button bottom-22">
        <span class="sr-only">Create organization</span>
        <Icon name="add" class="fill-on-primary size-6" />
      </Link>
      {/* TODO overflow, pagination, scrolling */}
      <main class="text-title-lg px-6">
        <ul class="grid grid-cols-[1fr_auto_auto_auto]">
          <For each={data().organizations} fallback={<p>Loading organizations...</p>}>
            {(organization) => {
              return (
                <Show when={!isOrganization(organization) || !isDeleting(organization.id)}>
                  <li class="bg-surface-container rounded-large col-span-full grid grid-cols-subgrid items-center p-4">
                    <span class="ps-3">{organization.name}</span>

                    <Show when={isOrganization(organization) && organization.id}>
                      {(id) => (
                        <Link
                          to={MembersRoute.path}
                          params={{ id: id() }}
                          data-variant="standard"
                          class="icon-button"
                        >
                          <span class="sr-only">Open</span>
                          <Icon name="open-in-new-window" class="fill-on-surface size-6" />
                        </Link>
                      )}
                    </Show>
                    <button data-variant="standard" class="icon-button">
                      <span class="sr-only">Edit</span>
                      <Icon name="edit" class="fill-on-surface size-6" />
                    </button>

                    <button
                      disabled={isLastOrganization()}
                      onClick={() => deleteMutation.mutate(organization.id)}
                      data-variant="standard"
                      class="icon-button"
                    >
                      <span class="sr-only">Delete</span>
                      <Icon name="close" class="fill-on-surface size-6" />
                    </button>
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

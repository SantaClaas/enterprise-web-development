import { createFileRoute, Link } from "@tanstack/solid-router";
import { For, type ParentProps } from "solid-js";

import { ErrorDetails } from "../../../../ErrorDetails";
import Icon from "../../../../Icon";
import type { Id as OrganizationId } from "../../../../organization";
import { Title } from "../../../../Title";
import { TopAppBar } from "../../../../TopAppBar";
import type { UserId } from "../../../../user";

type Organization = {
  id: OrganizationId;
  name: string;
  users: { id: UserId; name: string; username: string }[];
};

function Page(properties: ParentProps<{ title: string }>) {
  return (
    <>
      <TopAppBar
        title={properties.title}
        leadingAction={
          <Link to="/organizations" data-position="leading" class="action-button">
            <Icon name="arrow-back" class="fill-on-surface size-6" />
            <span class="sr-only">Back</span>
          </Link>
        }
      />
      <main class="px-6">{properties.children}</main>
    </>
  );
}

export const Route = createFileRoute("/organizations/$id/members/")({
  component: RouteComponent,
  async loader({ params, abortController }) {
    const response = await fetch(`/api/organizations/${params.id}`, {
      method: "GET",
      signal: abortController.signal,
    });

    if (!response.ok)
      throw new Error(`Error fetching organization: ${response.status} ${await response.text()}`);

    return (await response.json()) as Organization;
  },
  // TODO error component, pending component
  errorComponent(properties) {
    return (
      <Page title="Error">
        <ErrorDetails
          {...properties}
          title="Error loading organization"
          explainer="Sorry, an error occurred while loading the organization. Please try again later."
        />
      </Page>
    );
  },
});

function RouteComponent() {
  const organization = Route.useLoaderData();

  // TODO handle user can not delete themselves or delete all users

  return (
    <>
      <Title title={organization().name} />
      <Page title={organization().name}>
        <h2 class="text-headline-md">Users</h2>
        {/* Expect an organization to have at least one user */}
        <ul class="mt-4 grid grid-cols-[1fr_auto] gap-2">
          <For each={organization().users}>
            {(user) => (
              <li class="text-title-lg bg-surface-container rounded-large col-span-full grid grid-cols-subgrid py-2 ps-6 pe-2">
                <span class="content-center">
                  <span class="font-semibold">{user.name}</span> <span>({user.username})</span>
                </span>
                <button class="p-3">
                  <span class="sr-only">Delete</span>
                  <Icon name="close" class="fill-on-surface size-6" />
                </button>
              </li>
            )}
          </For>
        </ul>
        <Link
          to="/organizations/$id/members/add"
          params={{ id: organization().id }}
          class="floating-action-button"
        >
          <span class="sr-only">Add Member</span>
          <Icon name="add" class="fill-on-primary size-6" />
        </Link>
      </Page>
    </>
  );
}

import { createFileRoute, Link } from "@tanstack/solid-router";
import { For, type VoidProps } from "solid-js";

import Icon from "../../../Icon";
import { Title } from "../../../Title";
import { useOrganizations, type Organization } from "../../../useOrganizations";

export const Route = createFileRoute("/_app/organizations/")({
  component: Organizations,
});

function Card(properties: VoidProps<{ organization: Organization }>) {
  return (
    <li class="bg-surface-container rounded-large col-span-full grid grid-cols-subgrid items-center p-4">
      <span class="ps-3">{properties.organization.name}</span>
      {/* TODO accessibility, the whole content should not be wrapped in a link as that messes withs screen readers */}
      <Link to="/organizations/$id/members" params={{ id: properties.organization.id }} class="p-3">
        <span class="sr-only">Open</span>
        <Icon name="open-in-new-window" class="fill-on-surface size-6" />
      </Link>
      <button class="p-3">
        <span class="sr-only">Edit</span>
        <Icon name="edit" class="fill-on-surface size-6" />
      </button>
      <button class="p-3">
        <span class="sr-only">Delete</span>
        <Icon name="close" class="fill-on-surface size-6" />
      </button>
    </li>
  );
}

function Organizations() {
  const organizations = useOrganizations();
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
          <For each={organizations()} fallback={<p>Loading organizations...</p>}>
            {(organization) => <Card organization={organization} />}
          </For>
        </ul>
      </main>
    </>
  );
}

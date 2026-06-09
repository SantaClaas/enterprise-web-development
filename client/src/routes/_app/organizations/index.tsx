import { createFileRoute, Link } from "@tanstack/solid-router";
import { createResource, For, type VoidProps } from "solid-js";

import { Title } from "../../../Title";
import { useUserContext } from "../../../userContext";

export const Route = createFileRoute("/_app/organizations/")({
  component: Organizations,
});

type OrganizationId = string & { __brand: "OrganizationId" };
type Organization = {
  id: OrganizationId;
  name: string;
};

function Card(properties: VoidProps<{ organization: Organization }>) {
  return (
    <li class="contents">
      {/* TODO accessibility, the whole content should not be wrapped in a link as that messes withs screen readers */}
      <Link
        to="/organizations/$id/members"
        params={{ id: properties.organization.id }}
        class="bg-surface-container rounded-large block p-4"
      >
        <span class="sr-only">Open</span> {properties.organization.name}
      </Link>
    </li>
  );
}

function Organizations() {
  const userContext = useUserContext();

  const [organizations] = createResource(async () => {
    const userId = await userContext.getUserId;

    const response = await fetch(`/api/users/${userId}/organizations`, {
      method: "GET",
    });

    if (!response.ok)
      throw new Error(`Error fetching organizations: ${response.status} ${await response.text()}`);

    return (await response.json()) as Organization[];
  });
  return (
    <>
      <Title title="Organizations"></Title>
      {/* TODO overflow, pagination, scrolling */}
      <main class="text-title-lg px-6">
        <ul>
          <For each={organizations()} fallback={<p>Loading organizations...</p>}>
            {(organization) => <Card organization={organization} />}
          </For>
        </ul>
      </main>
    </>
  );
}

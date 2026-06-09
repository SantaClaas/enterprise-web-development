import { createFileRoute, redirect } from "@tanstack/solid-router";
import { createResource } from "solid-js";

import { Title } from "../../Title";
import { useUserContext } from "../../userContext";

export const Route = createFileRoute("/_app/organizations")({
  component: Organizations,
});

type OrganizationId = string & { __brand: "OrganizationId" };
type Organization = {
  id: OrganizationId;
  name: string;
};

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
      <Title>Organizations</Title>
      <main class="bg-slate-50"></main>
    </>
  );
}

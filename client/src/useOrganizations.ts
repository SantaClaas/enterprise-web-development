import { createResource } from "solid-js";

import type { OrganizationId } from "./branded";
import { useUserContext } from "./userContext";

export type Organization = {
  id: OrganizationId;
  name: string;
};

export function useOrganizations() {
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

  return organizations;
}

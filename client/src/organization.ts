import { queryOptions } from "@tanstack/solid-query";

import { QUERY_BASE, type Id as UserId } from "./user";

export type Id = string & { __brand: "OrganizationId" };
export type Organization = {
  id: Id;
  name: string;
};

export type OptimisticOrganization = Omit<Organization, "id">;

export const query = (userId: UserId | undefined, signal?: AbortSignal) =>
  queryOptions({
    queryKey: [QUERY_BASE, userId, "organizations"],
    async queryFn(): Promise<(Organization | OptimisticOrganization)[]> {
      const response = await fetch(`/api/users/${userId}/organizations`, {
        method: "GET",
        signal,
      });

      if (!response.ok)
        throw new Error(
          `Error fetching organizations: ${response.status} ${await response.text()}`,
        );

      // Safe cast because parsing requires the expectation we know what the API returns
      return (await response.json()) as Organization[];
    },
    enabled: Boolean(userId),
  });

export async function deleteOrganization(id: Id) {
  const response = await fetch(`/api/organizations/${id}`, {
    method: "DELETE",
  });

  if (!response.ok)
    throw new Error("Failed to delete organization. See network response for more details.");
}

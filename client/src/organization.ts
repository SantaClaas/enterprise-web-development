import { queryOptions } from "@tanstack/solid-query";

import { QUERY_BASE, type UserId as UserId } from "./user";

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

export async function createOrganization(userId: UserId, name: string) {
  //TODO change the endpoint to just accept text/plain with the new organization name as that is all that is required
  const response = await fetch(`/api/users/${userId}/organizations`, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain",
    },
    body: name,
  });

  if (!response.ok) {
    // TODO error handling
    console.error("Error creating organization", await response.text());
    throw new Error("Failed to create organization. See console for more details.");
  }
}

export async function updateOrganizationName(userId: UserId, id: Id, name: string) {
  const response = await fetch(`/api/users/${userId}/organizations/${id}/name`, {
    method: "PUT",
    headers: {
      "Content-Type": "text/plain",
    },
    body: name,
  });

  if (!response.ok) {
    // TODO error handling
    console.error("Error updating organization name", await response.text());
    throw new Error("Failed to update organization name. See console for more details.");
  }
}

export const isOrganization = (
  organization: Organization | OptimisticOrganization,
): organization is Organization => "id" in organization;

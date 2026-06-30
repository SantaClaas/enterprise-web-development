import { infiniteQueryOptions, queryOptions } from "@tanstack/solid-query";

import { QUERY_BASE, type UserId } from "@/user";

export type Id = string & { __brand: "OrganizationId" };
export type OrganizationRole = "MEMBER" | "ADMINISTRATOR" | "OWNER";
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

const ORG_PAGE_SIZE = 20;

export const pagedQuery = (userId: UserId | undefined) =>
  infiniteQueryOptions({
    queryKey: [QUERY_BASE, userId, "organizations", "paged"],
    async queryFn({ pageParam, signal }): Promise<Organization[]> {
      const response = await fetch(
        `/api/users/${userId}/organizations?page=${pageParam}&size=${ORG_PAGE_SIZE}`,
        { method: "GET", signal },
      );

      if (!response.ok)
        throw new Error(
          `Error fetching organizations: ${response.status} ${await response.text()}`,
        );

      return (await response.json()) as Organization[];
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === ORG_PAGE_SIZE ? allPages.length : undefined,
    enabled: Boolean(userId),
  });

export async function addMember(organizationId: Id, username: string) {
  const response = await fetch(`/api/organizations/${organizationId}/members/registrations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username }),
  });

  if (!response.ok)
    throw new Error("Failed to add member. See network response for more details.");
}

export async function removeMember(organizationId: Id, userId: UserId) {
  const response = await fetch(`/api/organizations/${organizationId}/members/${userId}`, {
    method: "DELETE",
  });

  if (!response.ok)
    throw new Error("Failed to remove member. See network response for more details.");
}

export async function changeMemberRole(organizationId: Id, userId: UserId, role: OrganizationRole) {
  const response = await fetch(`/api/organizations/${organizationId}/members/${userId}/role`, {
    method: "PUT",
    headers: { "Content-Type": "text/plain" },
    body: role,
  });

  if (!response.ok)
    throw new Error("Failed to change member role. See network response for more details.");
}

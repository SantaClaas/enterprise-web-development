import { queryOptions } from "@tanstack/solid-query";

import { QUERY_BASE, type Id as UserId } from "./user";

export type Id = string & { __brand: "OrganizationId" };
export type Organization = {
  id: Id;
  name: string;
};

export const query = (userId: UserId | undefined) =>
  queryOptions({
    queryKey: [QUERY_BASE, userId, "organizations"],
    async queryFn() {
      const response = await fetch(`/api/users/${userId}/organizations`, {
        method: "GET",
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

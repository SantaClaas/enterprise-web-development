import { queryOptions, useQueryClient } from "@tanstack/solid-query";
import { createResource } from "solid-js";

import type { ProjectId } from "./branded";
import { idQuery, QUERY_BASE } from "./user";

export type Project = { id: ProjectId; name: string };

export function useProjects() {
  const queryClient = useQueryClient();

  const [projects] = createResource(async () => {
    const userId = await queryClient.fetchQuery(idQuery);

    const response = await fetch(`/api/users/${userId}/projects`, {
      method: "GET",
    });

    if (!response.ok)
      throw new Error(`Error fetching projects: ${response.status} ${await response.text()}`);

    return (await response.json()) as Project[];
  });

  return projects;
}

export const query = (userId: string | undefined) =>
  queryOptions({
    queryKey: [QUERY_BASE, userId, "projects"],
    async queryFn() {
      const response = await fetch(`/api/users/${userId}/projects`, {
        method: "GET",
      });

      if (!response.ok)
        throw new Error(`Error fetching projects: ${response.status} ${await response.text()}`);

      // Safe cast because parsing requires the expectation we know what the API returns
      return (await response.json()) as Project[];
    },
    enabled: Boolean(userId),
  });

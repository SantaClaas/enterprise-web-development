import { useQueryClient } from "@tanstack/solid-query";
import { createResource } from "solid-js";

import type { ProjectId } from "./branded";
import { idQuery } from "./user";

export type Project = { id: ProjectId; name: string };

export function useProjects() {
  const queryClient = useQueryClient();

  const [projects] = createResource(async () => {
    const userId = queryClient.fetchQuery(idQuery);

    const response = await fetch(`/api/users/${userId}/projects`, {
      method: "GET",
    });

    if (!response.ok)
      throw new Error(`Error fetching projects: ${response.status} ${await response.text()}`);

    return (await response.json()) as Project[];
  });

  return projects;
}

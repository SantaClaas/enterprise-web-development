import { createResource } from "solid-js";

import type { ProjectId } from "./branded";
import { useUserContext } from "./userContext";

export type Project = { id: ProjectId; name: string };

export function useProjects() {
  const userContext = useUserContext();

  const [projects] = createResource(async () => {
    const userId = await userContext.getUserId;

    const response = await fetch(`/api/users/${userId}/projects`, {
      method: "GET",
    });

    if (!response.ok)
      throw new Error(`Error fetching projects: ${response.status} ${await response.text()}`);

    return (await response.json()) as Project[];
  });

  return projects;
}

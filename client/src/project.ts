import { infiniteQueryOptions, queryOptions, useQueryClient } from "@tanstack/solid-query";
import { createResource } from "solid-js";

import { type Organization, type Id as OrganizationId } from "./organization";
import { idQuery, QUERY_BASE } from "./user";

export type Id = string & { __brand: "ProjectId" };
export type Project = { id: Id; name: string; organization: Organization };
export type OptimisticProject = Omit<Project, "id">;

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

export const query = (userId: string | undefined, signal?: AbortSignal) =>
  queryOptions({
    queryKey: [QUERY_BASE, userId, "projects"],
    async queryFn(): Promise<(Project | OptimisticProject)[]> {
      const response = await fetch(`/api/users/${userId}/projects`, {
        method: "GET",
        signal,
      });

      if (!response.ok)
        throw new Error(`Error fetching projects: ${response.status} ${await response.text()}`);

      // Safe cast because parsing requires the expectation we know what the API returns
      return (await response.json()) as Project[];
    },
    enabled: Boolean(userId),
  });

export type UpdateProjectParameters = {
  userId: string;
  id: Id;
  name: string;
  organizationId: OrganizationId;
};

export async function updateProject({ userId, id, ...parameters }: UpdateProjectParameters) {
  const response = await fetch(`/api/users/${userId}/projects/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(parameters),
  });

  if (!response.ok)
    throw new Error(`Error updating project: ${response.status} ${await response.text()}`);
}

export const isProject = (project: Project | OptimisticProject): project is Project =>
  "id" in project;

const PROJECT_PAGE_SIZE = 20;

export const pagedQuery = (userId: string | undefined) =>
  infiniteQueryOptions({
    queryKey: [QUERY_BASE, userId, "projects", "paged"],
    async queryFn({ pageParam, signal }): Promise<Project[]> {
      const response = await fetch(
        `/api/users/${userId}/projects?page=${pageParam}&size=${PROJECT_PAGE_SIZE}`,
        { method: "GET", signal },
      );

      if (!response.ok)
        throw new Error(`Error fetching projects: ${response.status} ${await response.text()}`);

      return (await response.json()) as Project[];
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === PROJECT_PAGE_SIZE ? allPages.length : undefined,
    enabled: Boolean(userId),
  });

export async function deleteProject(id: Id) {
  const response = await fetch(`/api/projects/${id}`, {
    method: "DELETE",
  });

  if (!response.ok)
    throw new Error(`Failed to delete project. See network response for more details.`);
}

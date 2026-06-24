import { queryOptions } from "@tanstack/solid-query";

export type UserId = string & { __brand: "UserId" };

/** Custom error to differentiate between network, server and authentication errors */
export class UnauthenticatedError extends Error {}

/**
 * Sharable reference to the part of the user query that invalidates all user dependent data. Also
 * used to avoid spelling mistakes and find references easier.
 */
export const QUERY_BASE = "user";
export const idQuery = queryOptions({
  queryKey: [QUERY_BASE, "id"],
  async queryFn() {
    const response = await fetch("/api/users/current/id");

    // Tanstack query will bubble the error in the beforeLoad handler for the root path that checks authentication
    if (response.status === 401 || response.status === 403)
      throw new UnauthenticatedError("User is not authenticated");
    if (!response.ok)
      throw new Error(
        `Error fetching current user ID: ${response.status} ${await response.text()}`,
      );

    // Safe cast because parsing requires the expectation we know what the API returns
    return (await response.text()) as UserId;
  },
  // The user id is valid for the whole runtime of the application and needs to be invalidated manually when the user signs out
  staleTime: Infinity,
  gcTime: Infinity,
  retry: false,
});

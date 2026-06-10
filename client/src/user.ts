import { queryOptions } from "@tanstack/solid-query";

import type { UserId } from "./branded";

/** Custom error to differentiate between network, server and authentication errors */
export class UnauthenticatedError extends Error {}

export const idQueryOptions = queryOptions({
  queryKey: ["user", "id"],
  async queryFn() {
    const response = await fetch("/api/users/current/id");

    // Tanstack query will bubble the error in the beforeLoad handler for the root path that checks authentication
    if (response.status === 401) throw new UnauthenticatedError("User is not authenticated");
    if (!response.ok)
      throw new Error(
        `Error fetching current user ID: ${response.status} ${await response.text()}`,
      );

    // Safe cast because parsing requires the expectation we know what the API returns
    return (await response.text()) as UserId;
  },
  // The user id is valid for the whole runtime of the application and needs to be invalidated manually when the user signs out
  staleTime: Infinity,
});

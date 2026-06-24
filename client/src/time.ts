import { queryOptions } from "@tanstack/solid-query";

import type { UserId } from "./user";

export type TimeId = string & { __brand: "TimeId" };

export type Time = {
  id: TimeId;
  start: Temporal.Instant;
  end: Temporal.Instant;
};

export const query = (userId: string | undefined, signal?: AbortSignal) =>
  queryOptions({
    queryKey: ["users", userId, "times"],
    async queryFn(): Promise<Time[]> {
      const response = await fetch(`/api/users/${userId}/times`, {
        method: "GET",
        signal,
      });

      if (!response.ok)
        throw new Error(`Error fetching times: ${response.status} ${await response.text()}`);

      const times: Time[] = await response.json();
      for (const time of times) {
        time.start = Temporal.Instant.from(time.start);
        time.end = Temporal.Instant.from(time.end);
      }

      return times;
    },
    enabled: Boolean(userId),
  });

export type UpdateParameters = {
  userId: UserId;
  times: Time[];
};

export async function updateTimes({ userId, times }: UpdateParameters) {
  const response = await fetch(`/api/users/${userId}/times`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(times),
  });

  if (!response.ok) throw new Error("Error updating times");
}

export async function deleteTimes({ userId, timeIds }: { userId: UserId; timeIds: TimeId[] }) {
  const response = await fetch(`/api/users/${userId}/times`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(timeIds),
  });

  if (!response.ok) throw new Error("Error deleting times");
}

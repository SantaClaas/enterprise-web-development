import { queryOptions } from "@tanstack/solid-query";

import { type Id as ProjectId } from "./project";
import { QUERY_BASE, type UserId } from "./user";

export const TIMER_STATUS = {
  RUNNING: "RUNNING",
  PAUSED: "PAUSED",
} as const;

export type TimerStatus = (typeof TIMER_STATUS)[keyof typeof TIMER_STATUS];

export type TimerEntryId = string & { __brand: "TimerEntryId" };

export type TimerEntry = {
  id: TimerEntryId;
  startedAt: string;
  pausedAt: string | null;
};

export type TimerData = {
  accumulatedMilliseconds: number; // sum of all completed start-pause entry durations
  entries: TimerEntry[];
} & (
  | {
      status: typeof TIMER_STATUS.RUNNING;
      /** ISO 8601 */
      currentPeriodStart: string;
    }
  | {
      status: typeof TIMER_STATUS.PAUSED;
      currentPeriodStart?: never;
    }
);

export const query = (userId: UserId | undefined) =>
  queryOptions({
    queryKey: [QUERY_BASE, userId, "timer"],
    async queryFn(): Promise<TimerData | null> {
      const response = await fetch(`/api/users/${userId}/timer`);
      if (response.status === 404) return null;
      if (!response.ok) throw new Error(`Error fetching timer: ${response.status}`);
      return response.json() as Promise<TimerData>;
    },
    enabled: Boolean(userId),
  });

export async function startTimer(userId: UserId): Promise<TimerData> {
  const response = await fetch(`/api/users/${userId}/timer/start`, { method: "POST" });
  if (!response.ok) throw new Error(`Error starting timer: ${response.status}`);
  return response.json() as Promise<TimerData>;
}

export async function pauseTimer(userId: UserId): Promise<TimerData> {
  const response = await fetch(`/api/users/${userId}/timer/pause`, { method: "POST" });
  if (!response.ok) throw new Error(`Error pausing timer: ${response.status}`);
  return response.json() as Promise<TimerData>;
}

export async function stopTimer(userId: UserId, projectId: ProjectId): Promise<void> {
  const response = await fetch(`/api/users/${userId}/timer/stop`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ projectId }),
  });
  if (!response.ok) throw new Error(`Error stopping timer: ${response.status}`);
}

export async function deleteTimerEntry(
  userId: UserId,
  entryId: TimerEntryId,
): Promise<TimerData | "timer deleted"> {
  const response = await fetch(`/api/users/${userId}/timer/entries/${entryId}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error(`Error deleting timer entry: ${response.status}`);
  if (response.status === 204) return "timer deleted";
  return response.json() as Promise<TimerData>;
}

export async function discardTimer(userId: UserId): Promise<void> {
  const response = await fetch(`/api/users/${userId}/timer`, { method: "DELETE" });
  if (!response.ok) throw new Error(`Error discarding timer: ${response.status}`);
}

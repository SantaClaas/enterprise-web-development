import { useMutation, useQuery, useQueryClient } from "@tanstack/solid-query";
import { createFileRoute } from "@tanstack/solid-router";
import { createEffect, createMemo, createSignal, For, onCleanup, Show, Suspense } from "solid-js";

import Icon from "@/Icon";
import { isProject, query as projectQuery, type Id as ProjectId } from "@/project";
import { query as timesQuery } from "@/time";
import {
  discardTimer,
  pauseTimer,
  query as timerQuery,
  startTimer,
  stopTimer,
  type TimerData,
} from "@/timer";
import { Title } from "@/Title";
import { idQuery } from "@/user";

export const Route = createFileRoute("/_app/timer")({
  component: TimerPage,
  async loader({ context: { queryClient } }) {
    const userId = await queryClient.ensureQueryData(idQuery);
    await Promise.all([
      queryClient.prefetchQuery(timerQuery(userId)),
      queryClient.prefetchQuery(projectQuery(userId)),
    ]);
    return { userId };
  },
});

function formatElapsed(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [hours, minutes, seconds].map((n) => String(n).padStart(2, "0")).join(":");
}

function TimerPage() {
  const { userId } = Route.useLoaderData()();
  const queryClient = useQueryClient();

  const timerQ = useQuery(() => timerQuery(userId));
  const timer = (): TimerData | null => timerQ.data ?? null;
  const status = () => timer()?.status ?? null;

  // Project selection is purely a local UI state — the DB only knows RUNNING or PAUSED
  const [isSelectingProject, setIsSelectingProject] = createSignal(false);

  const projects = useQuery(() => projectQuery(userId));
  const selectableProjects = () => projects.data?.filter(isProject) ?? [];

  // Tick every second while the timer is RUNNING to update the display
  const [tick, setTick] = createSignal(0, { equals: false });
  createEffect(() => {
    if (status() === "RUNNING") {
      const interval = setInterval(() => setTick((n) => n + 1), 1000);
      onCleanup(() => clearInterval(interval));
    }
  });

  const elapsedMs = createMemo(() => {
    const t = timer();
    if (!t) return 0;
    if (t.status !== "RUNNING") return t.accumulatedMs;
    // RUNNING: subscribe to tick for live updates
    void tick();
    return (
      t.accumulatedMs +
      Temporal.Now.instant()
        .since(Temporal.Instant.from(t.currentPeriodStart!))
        .total("milliseconds")
    );
  });

  function setTimerCache(data: TimerData) {
    queryClient.setQueryData(timerQuery(userId).queryKey, data);
  }

  const startMutation = useMutation(() => ({
    mutationFn: () => startTimer(userId),
    onSuccess: setTimerCache,
  }));

  const pauseMutation = useMutation(() => ({
    mutationFn: () => pauseTimer(userId),
    onSuccess: setTimerCache,
  }));

  const saveMutation = useMutation(() => ({
    mutationFn: (projectId: ProjectId) => stopTimer(userId, projectId),
    onSuccess: () => {
      setIsSelectingProject(false);
      queryClient.setQueryData(timerQuery(userId).queryKey, null);
      void queryClient.invalidateQueries({ queryKey: timesQuery(userId).queryKey, exact: true });
    },
  }));

  const discardMutation = useMutation(() => ({
    mutationFn: () => discardTimer(userId),
    onSuccess: () => {
      setIsSelectingProject(false);
      queryClient.setQueryData(timerQuery(userId).queryKey, null);
    },
  }));

  const isPending = () =>
    startMutation.isPending ||
    pauseMutation.isPending ||
    saveMutation.isPending ||
    discardMutation.isPending;

  return (
    <>
      <Title title="Timer" />
      <main class="flex h-full flex-col items-center justify-center gap-10">
        <time
          class="font-mono text-7xl tabular-nums tracking-widest text-on-surface"
          datetime={`PT${Math.floor(elapsedMs() / 1000)}S`}
        >
          {formatElapsed(elapsedMs())}
        </time>

        <div class="flex gap-4">
          <Show when={!status()}>
            <button
              onClick={() => startMutation.mutate()}
              disabled={isPending()}
              data-variant="filled"
              class="button gap-2"
            >
              <Icon name="play-arrow" class="size-6 fill-on-primary" />
              Start
            </button>
          </Show>

          <Show when={status() === "RUNNING"}>
            <button
              onClick={() => pauseMutation.mutate()}
              disabled={isPending()}
              data-variant="outlined"
              class="button gap-2"
            >
              <Icon name="pause" class="size-6 fill-on-surface-variant" />
              Pause
            </button>
          </Show>

          <Show when={status() === "PAUSED"}>
            <button
              onClick={() => startMutation.mutate()}
              disabled={isPending()}
              data-variant="filled"
              class="button gap-2"
            >
              <Icon name="play-arrow" class="size-6 fill-on-primary" />
              Resume
            </button>
            <button
              onClick={() => setIsSelectingProject(true)}
              disabled={isPending()}
              data-variant="outlined"
              class="button gap-2"
            >
              <Icon name="stop" class="size-6 fill-on-surface-variant" />
              Stop
            </button>
          </Show>
        </div>
      </main>

      <Show when={isSelectingProject()}>
        <div class="fixed inset-0 z-50 flex items-end justify-center bg-black/50 lg:items-center">
          <div class="bg-surface-container-high rounded-t-large lg:rounded-large w-full max-w-lg p-6">
            <h2 class="text-title-lg text-on-surface mb-1">Select a project</h2>
            <p class="text-body-md text-on-surface-variant mb-4">
              {formatElapsed(elapsedMs())} will be saved as a time entry.
            </p>
            <Suspense
              fallback={
                <p class="text-on-surface-variant py-4 text-center">Loading projects...</p>
              }
            >
              <ul class="flex flex-col gap-2">
                <For each={selectableProjects()}>
                  {(project) => (
                    <li>
                      <button
                        onClick={() => saveMutation.mutate(project.id)}
                        disabled={isPending()}
                        class="bg-surface-container hover:bg-surface-container-highest rounded-medium text-on-surface w-full px-4 py-3 text-left transition-colors disabled:opacity-50"
                      >
                        {project.name}
                      </button>
                    </li>
                  )}
                </For>
              </ul>
            </Suspense>
            <button
              onClick={() => discardMutation.mutate()}
              disabled={isPending()}
              data-variant="outlined"
              class="button mt-6 w-full"
            >
              Discard
            </button>
          </div>
        </div>
      </Show>
    </>
  );
}

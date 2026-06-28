import { useMutation, useQuery, useQueryClient } from "@tanstack/solid-query";
import { createFileRoute } from "@tanstack/solid-router";
import { createEffect, createMemo, createSignal, For, onCleanup, Show, Suspense } from "solid-js";

import { FloatingActionButtonAction } from "@/FloatingActionButton";
import Icon from "@/Icon";
import { useI18n } from "@/i18n";
import { isProject, query as projectQuery, type Id as ProjectId } from "@/project";
import { query as timesQuery } from "@/time";
import {
  deleteTimerEntry,
  discardTimer,
  pauseTimer,
  query as timerQuery,
  startTimer,
  stopTimer,
  type TimerData,
  type TimerEntry,
  type TimerEntryId,
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

function EntryRow(properties: {
  entry: TimerEntry;
  tick: number;
  onDelete: () => void;
  isDeleting: boolean;
}) {
  const { t, locale } = useI18n();
  const timeFormatter = createMemo(
    () => new Intl.DateTimeFormat(locale(), { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
  );
  const durationFormatter = createMemo(
    () =>
      new Intl.DurationFormat(locale(), {
        style: "digital",
        hours: "2-digit",
        minutes: "2-digit",
        seconds: "2-digit",
      }),
  );
  const startedAt = () => Temporal.Instant.from(properties.entry.startedAt);

  const pausedAt = () =>
    properties.entry.pausedAt ? Temporal.Instant.from(properties.entry.pausedAt) : null;
  const duration = () => {
    const end = pausedAt() ?? (void properties.tick, Temporal.Now.instant());
    return end.since(startedAt()).round({ smallestUnit: "second", largestUnit: "hour" });
  };

  return (
    <li class="text-body-md grid grid-cols-[1fr_1fr_1fr_auto] items-center gap-2">
      <time
        datetime={properties.entry.startedAt}
        class="bg-surface-container text-on-surface rounded-full px-3 py-1.5 text-center"
      >
        {timeFormatter().format(startedAt())}
      </time>
      <Show
        when={pausedAt()}
        fallback={
          <span class="bg-surface-container text-primary rounded-full px-3 py-1.5 text-center">
            {t("timer-running-status")}
          </span>
        }
      >
        {(pausedAtInstant) => (
          <time
            datetime={properties.entry.pausedAt!}
            class="bg-surface-container text-on-surface rounded-full px-3 py-1.5 text-center"
          >
            {timeFormatter().format(pausedAtInstant())}
          </time>
        )}
      </Show>
      <time
        datetime={duration().toString()}
        class="bg-surface-container text-on-surface rounded-full px-3 py-1.5 text-center"
      >
        {durationFormatter().format(duration())}
      </time>
      <button
        onClick={properties.onDelete}
        disabled={properties.isDeleting}
        class="icon-button fill-on-surface-variant disabled:opacity-50"
      >
        <span class="sr-only">{t("timer-delete-entry")}</span>
        <Icon name="delete" class="size-5" />
      </button>
    </li>
  );
}

function TimerPage() {
  const { userId } = Route.useLoaderData()();
  const queryClient = useQueryClient();
  const { t, locale } = useI18n();
  const durationFormatter = createMemo(
    () =>
      new Intl.DurationFormat(locale(), {
        style: "digital",
        hours: "2-digit",
        minutes: "2-digit",
        seconds: "2-digit",
      }),
  );

  const timer = useQuery(() => timerQuery(userId));

  // Project selection is purely a local UI state — the DB only knows RUNNING or PAUSED
  const [isSelectingProject, setIsSelectingProject] = createSignal(false);

  const projects = useQuery(() => projectQuery(userId));
  const selectableProjects = () => projects.data?.filter(isProject) ?? [];

  // Tick every second while the timer is RUNNING to update the display
  const [tick, setTick] = createSignal(0, { equals: false });
  createEffect(() => {
    if (timer.data?.status === "RUNNING") {
      const interval = setInterval(() => setTick((n) => n + 1), 1_000);
      onCleanup(() => clearInterval(interval));
    }
  });

  const elapsed = createMemo((): Temporal.Duration => {
    const currentTimer = timer.data;

    let elapsed = Temporal.Duration.from({
      milliseconds: currentTimer?.accumulatedMilliseconds ?? 0,
    });

    if (currentTimer?.status === "RUNNING") {
      void tick();
      elapsed = elapsed.add(
        Temporal.Now.instant().since(Temporal.Instant.from(currentTimer.currentPeriodStart!)),
      );
    }

    return elapsed.round({ smallestUnit: "second", largestUnit: "hour" });
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

  const deleteEntryMutation = useMutation(() => ({
    mutationFn: (entryId: TimerEntryId) => deleteTimerEntry(userId, entryId),
    onSuccess: setTimerCache,
  }));

  const isPending = () =>
    startMutation.isPending ||
    pauseMutation.isPending ||
    saveMutation.isPending ||
    discardMutation.isPending ||
    deleteEntryMutation.isPending;

  const entries = () => timer.data?.entries;

  const floatingActionButtonLabel = createMemo(() => {
    if (timer.data?.status === "RUNNING") return t("timer-pause");
    if (timer.data?.status === "PAUSED") return t("timer-resume");
    return t("timer-start");
  });

  return (
    <>
      <Title title={t("timer-title")} />
      <Show when={!isSelectingProject()}>
        <FloatingActionButtonAction
          icon={timer.data?.status === "RUNNING" ? "pause" : "play-arrow"}
          label={floatingActionButtonLabel()}
          onClick={() =>
            timer.data?.status === "RUNNING" ? pauseMutation.mutate() : startMutation.mutate()
          }
        />
      </Show>
      <main class="flex min-h-full flex-col items-center justify-center gap-10 py-10">
        <time
          class="text-on-surface font-mono text-7xl tracking-widest tabular-nums"
          datetime={elapsed().toString()}
        >
          {durationFormatter().format(elapsed())}
        </time>

        <div class="flex gap-4">
          <Show when={!timer.data?.status}>
            <button
              onClick={() => startMutation.mutate()}
              disabled={isPending()}
              data-variant="filled"
              class="button gap-2"
            >
              <Icon name="play-arrow" class="fill-on-primary size-6" />
              {t("timer-start")}
            </button>
          </Show>

          <Show when={timer.data?.status === "RUNNING"}>
            <button
              onClick={() => pauseMutation.mutate()}
              disabled={isPending()}
              data-variant="outlined"
              class="button gap-2"
            >
              <Icon name="pause" class="fill-on-surface-variant size-6" />
              {t("timer-pause")}
            </button>
          </Show>

          <Show when={timer.data?.status === "PAUSED"}>
            <button
              onClick={() => startMutation.mutate()}
              disabled={isPending()}
              data-variant="filled"
              class="button gap-2"
            >
              <Icon name="play-arrow" class="fill-on-primary size-6" />
              {t("timer-resume")}
            </button>
            <button
              onClick={() => setIsSelectingProject(true)}
              disabled={isPending()}
              data-variant="outlined"
              class="button gap-2"
            >
              <Icon name="stop" class="fill-on-surface-variant size-6" />
              {t("timer-stop")}
            </button>
          </Show>
        </div>

        <Show when={entries() && entries()!.length > 0}>
          <ol class="w-full max-w-sm space-y-2">
            <For each={timer.data?.entries.toReversed()}>
              {(entry) => (
                <EntryRow
                  entry={entry}
                  tick={tick()}
                  onDelete={() => deleteEntryMutation.mutate(entry.id)}
                  isDeleting={deleteEntryMutation.isPending}
                />
              )}
            </For>
          </ol>
        </Show>
      </main>

      <Show when={isSelectingProject()}>
        <div class="fixed inset-0 z-50 flex items-end justify-center bg-black/50 lg:items-center">
          <div class="bg-surface-container-high rounded-t-large lg:rounded-large w-full max-w-lg p-6">
            <h2 class="text-title-lg text-on-surface mb-1">{t("timer-select-project-title")}</h2>
            <p class="text-body-md text-on-surface-variant mb-4">
              {t("timer-select-project-body", {
                duration: durationFormatter().format(elapsed()),
              })}
            </p>
            <Suspense
              fallback={
                <p class="text-on-surface-variant py-4 text-center">{t("timer-loading-projects")}</p>
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
              {t("timer-discard")}
            </button>
          </div>
        </div>
      </Show>
    </>
  );
}

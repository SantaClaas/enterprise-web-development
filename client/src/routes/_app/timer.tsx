import { useMutation, useQuery, useQueryClient } from "@tanstack/solid-query";
import { createFileRoute } from "@tanstack/solid-router";
import { createEffect, createMemo, createSignal, For, onCleanup, Show, Suspense } from "solid-js";

import { FloatingActionButtonAction } from "@/FloatingActionButton";
import { useI18n } from "@/i18n";
import Icon from "@/Icon";
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
  TIMER_STATUS,
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
  now: Temporal.Instant;
  onDelete: () => void;
  isDeleting: boolean;
}) {
  const { t, locale } = useI18n();
  const timeFormatter = createMemo(
    () =>
      new Intl.DateTimeFormat(locale(), { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
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
    const end = pausedAt() ?? properties.now;
    return end.since(startedAt()).round({ smallestUnit: "second", largestUnit: "hour" });
  };

  return (
    <li
      data-testid="timer-entry"
      class="text-body-md grid grid-cols-[1fr_1fr_1fr_auto] items-center gap-2"
    >
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

  const projects = useQuery(() => projectQuery(userId));
  const selectableProjects = () => projects.data?.filter(isProject) ?? [];

  // Update every second while the timer is RUNNING to drive the display
  const [now, setNow] = createSignal(Temporal.Now.instant());
  createEffect(() => {
    if (timer.data?.status === TIMER_STATUS.RUNNING) {
      setNow(Temporal.Now.instant());
      const interval = setInterval(() => setNow(Temporal.Now.instant()), 1_000);
      onCleanup(() => clearInterval(interval));
    }
  });

  const elapsed = createMemo((): Temporal.Duration => {
    const currentTimer = timer.data;

    let elapsed = Temporal.Duration.from({
      milliseconds: currentTimer?.accumulatedMilliseconds ?? 0,
    });

    if (currentTimer?.status === TIMER_STATUS.RUNNING) {
      elapsed = elapsed.add(now().since(Temporal.Instant.from(currentTimer.currentPeriodStart)));
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
      selectProjectDialog?.requestClose();
      queryClient.setQueryData(timerQuery(userId).queryKey, null);
      void queryClient.invalidateQueries({ queryKey: timesQuery(userId).queryKey, exact: true });
    },
  }));

  const discardMutation = useMutation(() => ({
    mutationFn: () => discardTimer(userId),
    onSuccess: () => {
      selectProjectDialog?.requestClose();
      queryClient.setQueryData(timerQuery(userId).queryKey, null);
    },
  }));

  const deleteEntryMutation = useMutation(() => ({
    mutationFn: (entryId: TimerEntryId) => deleteTimerEntry(userId, entryId),
    onSuccess: (data) => {
      if (data === "timer deleted") {
        queryClient.setQueryData(timerQuery(userId).queryKey, null);
        return;
      }

      setTimerCache(data);
    },
  }));

  const isPending = () =>
    startMutation.isPending ||
    pauseMutation.isPending ||
    saveMutation.isPending ||
    discardMutation.isPending ||
    deleteEntryMutation.isPending;

  const entries = () => timer.data?.entries;

  const floatingActionButtonLabel = createMemo(() => {
    if (timer.data?.status === TIMER_STATUS.RUNNING) return t("timer-pause");
    if (timer.data?.status === TIMER_STATUS.PAUSED) return t("timer-resume");
    return t("timer-start");
  });

  function handleSelectProjectSubmit(event: SubmitEvent) {
    event.preventDefault();
    const submitter = event.submitter as HTMLButtonElement | null;
    const projectId = submitter?.value as ProjectId | null;
    if (!projectId) return;
    saveMutation.mutate(projectId);
  }

  const SELECT_PROJECT_DIALOG_ID = "select-project-dialog";

  let selectProjectDialog: HTMLDialogElement | undefined;

  return (
    <>
      <Title title={t("timer-title")} />
      <FloatingActionButtonAction
        icon={timer.data?.status === TIMER_STATUS.RUNNING ? "pause" : "play-arrow"}
        label={floatingActionButtonLabel()}
        onClick={() =>
          timer.data?.status === TIMER_STATUS.RUNNING
            ? pauseMutation.mutate()
            : startMutation.mutate()
        }
      />
      <main class="flex h-full flex-col items-center justify-center gap-10 overflow-y-auto py-10">
        <time
          data-testid="timer-display"
          class="text-on-surface text-display-lg font-mono tracking-widest tabular-nums"
          datetime={elapsed().toString()}
        >
          {durationFormatter().format(elapsed())}
        </time>

        <div class="flex gap-4">
          <Show when={!timer.data?.status}>
            <button
              data-testid="timer-start"
              onClick={() => startMutation.mutate()}
              disabled={isPending()}
              data-variant="filled"
              class="button gap-2"
            >
              <Icon name="play-arrow" class="fill-on-primary size-6" />
              {t("timer-start")}
            </button>
          </Show>

          <Show when={timer.data?.status === TIMER_STATUS.RUNNING}>
            <button
              data-testid="timer-pause"
              onClick={() => pauseMutation.mutate()}
              disabled={isPending()}
              data-variant="outlined"
              class="button gap-2"
            >
              <Icon name="pause" class="fill-on-surface-variant size-6" />
              {t("timer-pause")}
            </button>
          </Show>

          <Show when={timer.data?.status === TIMER_STATUS.PAUSED}>
            <button
              data-testid="timer-resume"
              onClick={() => startMutation.mutate()}
              disabled={isPending()}
              data-variant="filled"
              class="button gap-2"
            >
              <Icon name="play-arrow" class="fill-on-primary size-6" />
              {t("timer-resume")}
            </button>
            <button
              data-testid="timer-stop"
              disabled={isPending()}
              commandfor={SELECT_PROJECT_DIALOG_ID}
              command="show-modal"
              data-variant="outlined"
              class="button gap-2"
            >
              <Icon name="stop" class="fill-on-surface-variant size-6" />
              {t("timer-stop")}
            </button>
            <dialog
              data-testid="timer-select-project-dialog"
              id={SELECT_PROJECT_DIALOG_ID}
              closedby="any"
              ref={selectProjectDialog}
              class="bg-surface-container-high m-auto max-w-140 min-w-60 flex-col rounded-3xl pt-6 open:flex"
            >
              <h1 class="text-headline-sm text-on-surface px-6">
                {t("timer-select-project-title")}
              </h1>
              <p class="text-body-md text-on-surface-variant px-6 pt-4">
                {t("timer-select-project-body", {
                  duration: durationFormatter().format(elapsed()),
                })}
              </p>
              <form onSubmit={handleSelectProjectSubmit} class="px-6 pt-6">
                <Suspense
                  fallback={
                    <p class="text-on-surface-variant py-4 text-center">
                      {t("timer-loading-projects")}
                    </p>
                  }
                >
                  <ul class="flex flex-col gap-2">
                    <For each={selectableProjects()}>
                      {(project) => (
                        <li>
                          <button
                            value={project.id}
                            name="projectId"
                            type="submit"
                            disabled={isPending()}
                            data-variant="outlined"
                            class="button w-full"
                          >
                            {project.name}
                          </button>
                        </li>
                      )}
                    </For>
                  </ul>
                </Suspense>
              </form>
              <footer class="flex justify-end gap-x-2 px-6 py-5">
                <button
                  data-testid="timer-discard"
                  onClick={() => discardMutation.mutate()}
                  disabled={isPending()}
                  data-variant="text"
                  class="button text-label-lg"
                >
                  {t("timer-discard")}
                </button>
                <button
                  command="close"
                  commandfor={SELECT_PROJECT_DIALOG_ID}
                  disabled={isPending()}
                  data-variant="text"
                  class="button text-label-lg"
                >
                  {t("timer-close")}
                </button>
              </footer>
            </dialog>

            {/* open:flex items-end justify-center bg-black/50 lg:items-center */}
            {/* <dialog
              id="select-project-modal"
              class="bg-surface-container-high rounded-t-large lg:rounded-large w-full max-w-lg p-6"
            >
              <h2 class="text-title-lg text-on-surface mb-1">{t("timer-select-project-title")}</h2>
              <p class="text-body-md text-on-surface-variant mb-4">
                {t("timer-select-project-body", {
                  duration: durationFormatter().format(elapsed()),
                })}
              </p>
              <Suspense
                fallback={
                  <p class="text-on-surface-variant py-4 text-center">
                    {t("timer-loading-projects")}
                  </p>
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
            </dialog> */}
          </Show>
        </div>

        <Show when={entries() && entries()!.length > 0}>
          <ol class="w-full max-w-sm space-y-2">
            <For each={timer.data?.entries.toReversed()}>
              {(entry) => (
                <EntryRow
                  entry={entry}
                  now={now()}
                  onDelete={() => deleteEntryMutation.mutate(entry.id)}
                  isDeleting={deleteEntryMutation.isPending}
                />
              )}
            </For>
          </ol>
        </Show>
      </main>
    </>
  );
}

import { useInfiniteQuery, useMutation } from "@tanstack/solid-query";
import { createFileRoute } from "@tanstack/solid-router";
import { createMemo, createSignal, For, onCleanup, onMount, Show, type VoidProps } from "solid-js";

import { FloatingActionButton } from "@/components/FloatingActionButton";
import Icon from "@/components/Icon";
import { Title } from "@/components/Title";
import { useI18n } from "@/i18n";
import { deleteTimes, query, updateTimes, type Time, type TimeId } from "@/time";
import { idQuery, type UserId } from "@/user";

// Assume time zone does not change during the runtime of the application
const timeZone = Temporal.Now.timeZoneId();

export const Route = createFileRoute("/_app/times")({
  component: Times,
  async loader({ context: { queryClient } }) {
    const userId = await queryClient.ensureQueryData(idQuery);
    await queryClient.prefetchInfiniteQuery({ ...query(userId), pages: 1 });
    return { userId };
  },
});

type DayProperties = {
  day: Temporal.PlainDate;
  times: Time[];
  userId: UserId;
};

const today = Temporal.Now.plainDateISO();

function Day(properties: VoidProps<DayProperties>) {
  // Could do this with a custom styled checkbox and no JS
  const [isEdit, setIsEdit] = createSignal(false);
  const { t, locale } = useI18n();
  const dateFormatter = createMemo(
    () => new Intl.DateTimeFormat(locale(), { weekday: "long", month: "long", day: "numeric" }),
  );
  const timeFormatter = createMemo(
    () => new Intl.DateTimeFormat(locale(), { hour: "2-digit", minute: "2-digit" }),
  );
  const durationFormatter = createMemo(
    () =>
      new Intl.DurationFormat(locale(), {
        style: "digital",
        // hoursDisplay: "always",
        // minutesDisplay: "always",
        hours: "2-digit",
        minutes: "2-digit",
      }),
  );

  function cancelEdit() {
    setIsEdit(false);
  }

  const totalDuration = createMemo(() =>
    properties.times
      .reduce(
        (totalTime, time) => totalTime.add(time.end.since(time.start)),
        Temporal.Duration.from({ milliseconds: 0 }),
      )
      .round({ smallestUnit: "minute", largestUnit: "hour" }),
  );

  const dayId = properties.day.toString();
  const editFormId = "edit-" + dayId;

  // TODO optimistic update
  const updateMutation = useMutation(() => ({
    async mutationFn({
      userId,
      times,
      idsToDelete,
    }: {
      userId: UserId;
      times: Time[];
      idsToDelete: TimeId[];
    }) {
      console.debug("Updating times", { userId, times, idsToDelete });
      // Not very elegant but does the job for now
      const updatePromise = times.length > 0 ? updateTimes({ userId, times }) : Promise.resolve();
      const deletePromise =
        idsToDelete.length > 0 ? deleteTimes({ userId, timeIds: idsToDelete }) : Promise.resolve();
      await Promise.all([updatePromise, deletePromise]);
    },
    onSettled(_data, _error, variables, _result, context) {
      setIsEdit(false);
      context.client.invalidateQueries({ queryKey: query(variables.userId).queryKey, exact: true });
    },
  }));

  const TIME_PREFIX = "time-";
  function handleEditSubmit(event: SubmitEvent & { currentTarget: HTMLFormElement }) {
    event.preventDefault();

    const idsToDelete: TimeId[] = [];
    const times: Time[] = [];
    for (const element of event.currentTarget.elements) {
      if (!(element instanceof HTMLFieldSetElement)) continue;

      const timeIdInput = element.elements.namedItem("time-id") as HTMLInputElement;

      const timeId = timeIdInput.value as TimeId;

      console.debug("ELEMENTS", element.elements);
      const deleteInput = element.elements.namedItem(`delete-${timeId}`) as HTMLInputElement;

      if (deleteInput.checked) {
        idsToDelete.push(timeId);
        continue;
      }

      const startInput = element.elements.namedItem(`start-${timeId}`) as HTMLInputElement;
      const startTime = Temporal.PlainTime.from(startInput.value);
      const startInstant = properties.day
        .toZonedDateTime({ timeZone, plainTime: startTime })
        .toInstant();

      const endInput = element.elements.namedItem(`end-${timeId}`) as HTMLInputElement;
      const endTime = Temporal.PlainTime.from(endInput.value);
      const endInstant = properties.day
        .toZonedDateTime({ timeZone, plainTime: endTime })
        .toInstant();

      times.push({
        id: timeId,
        start: startInstant,
        end: endInstant,
      });
    }

    if (idsToDelete.length === 0 && times.length === 0) return;

    updateMutation.mutate({
      userId: properties.userId,
      times,
      idsToDelete,
    });
  }

  return (
    <>
      <article
        data-testid="times-day"
        data-is-edit={isEdit() ? "" : undefined}
        data-is-today={properties.day.equals(today) ? "" : undefined}
        class="bg-surface-container data-is-today:bg-primary-container text-on-surface fill-on-surface data-is-today:text-on-primary-container data-is-today:fill-on-primary rounded-large group relative grid grid-cols-[1fr_1fr_auto_auto] gap-2 p-4"
      >
        <h3 class="text-headline-md">{dateFormatter().format(properties.day)}</h3>
        <time
          datetime={totalDuration().toString()}
          class="text-headline-sm self-center text-right group-data-is-edit:invisible"
        >
          {durationFormatter().format(totalDuration())}
        </time>
        <button
          data-testid="times-edit"
          onClick={() => setIsEdit(!isEdit())}
          class="icon-button fill-on-surface group-data-is-edit:hidden"
        >
          <span class="sr-only">{t("times-edit")}</span>
          <Icon name="edit" class="size-6" />
        </button>

        <button
          data-testid="times-save"
          type="submit"
          form={editFormId}
          disabled={updateMutation.isPending}
          class="icon-button fill-on-surface hidden group-data-is-edit:block"
        >
          <span class="sr-only">{t("times-save")}</span>
          <Icon name="save" class="size-6" />
        </button>

        <button
          data-testid="times-cancel"
          onClick={cancelEdit}
          disabled={updateMutation.isPending}
          class="icon-button fill-on-surface hidden group-data-is-edit:block"
        >
          <span class="sr-only">{t("times-cancel")}</span>
          <Icon name="close" class="size-6" />
        </button>

        <ol class="contents group-data-is-edit:hidden">
          <For each={properties.times}>
            {(time) => {
              const duration = time.end
                .since(time.start)
                .round({ smallestUnit: "minute", largestUnit: "hour" });

              console.debug(time.end.toZonedDateTimeISO(timeZone).toPlainTime().toString());
              return (
                <li class="rounded-medium col-span-full grid grid-cols-3 gap-3 p-2">
                  <time datetime={time.start.toString()} class="bg-surface rounded-full p-2">
                    {timeFormatter().format(time.start)}
                  </time>
                  <time datetime={time.end.toString()} class="bg-surface rounded-full p-2">
                    {timeFormatter().format(time.end)}
                  </time>
                  <time datetime={duration.toString()} class="bg-surface rounded-full p-2">
                    {durationFormatter().format(duration)}
                  </time>
                </li>
              );
            }}
          </For>
        </ol>
        <form
          id={editFormId}
          onSubmit={handleEditSubmit}
          class="hidden group-data-is-edit:contents"
        >
          <For each={properties.times}>
            {(time) => {
              const duration = time.end
                .since(time.start)
                .round({ smallestUnit: "minute", largestUnit: "hour" });

              const startTime = time.start.toZonedDateTimeISO(timeZone).toPlainTime();

              const endTime = time.end.toZonedDateTimeISO(timeZone).toPlainTime();

              const [currentStartTime, setCurrentStartTime] = createSignal(startTime);
              const [currentEndTime, setCurrentEndTime] = createSignal(endTime);

              const currentStartTimeString = () => startTime.toString().substring(0, 5);
              const currentEndTimeString = () => endTime.toString().substring(0, 5);

              const newDuration = () =>
                currentEndTime()
                  .since(currentStartTime())
                  .round({ smallestUnit: "minute", largestUnit: "hour" });

              const formattedNewDuration = () => durationFormatter().format(newDuration());

              return (
                <fieldset
                  id={`${TIME_PREFIX}-${time.id}`}
                  disabled={updateMutation.isPending}
                  class="rounded-medium col-span-full grid grid-cols-3 gap-3 py-2 ps-2 has-checked:line-through"
                >
                  <input type="hidden" name="time-id" value={time.id} />
                  <label for={`start-${time.id}`} class="sr-only">
                    {t("times-start-time-label")}
                  </label>
                  <input
                    type="time"
                    id={`start-${time.id}`}
                    name={`start-${time.id}`}
                    value={currentStartTimeString()}
                    onChange={(event) =>
                      setCurrentStartTime(Temporal.PlainTime.from(event.currentTarget.value))
                    }
                    class="bg-surface rounded-full p-2"
                  />

                  <label for={`end-${time.id}`} class="sr-only">
                    {t("times-end-time-label")}
                  </label>
                  <input
                    type="time"
                    id={`end-${time.id}`}
                    name={`end-${time.id}`}
                    value={currentEndTimeString()}
                    onChange={(event) =>
                      setCurrentEndTime(Temporal.PlainTime.from(event.currentTarget.value))
                    }
                    class="bg-surface rounded-full p-2"
                  />

                  <div class="flex items-center gap-2">
                    <time datetime={duration.toString()} class="bg-surface grow rounded-full p-2">
                      {formattedNewDuration()}
                    </time>
                    <label class="icon-button group/delete">
                      <span class="sr-only">{t("times-delete")}</span>
                      <Icon name="delete" class="size-6 group-has-checked/delete:hidden" />
                      <Icon name="close" class="hidden size-6 group-has-checked/delete:block" />
                      <input
                        type="checkbox"
                        id={`delete-${time.id}`}
                        name={`delete-${time.id}`}
                        class="sr-only"
                      />
                    </label>
                  </div>
                </fieldset>
              );
            }}
          </For>
        </form>
      </article>
    </>
  );
}

type WeekProperties = {
  weekOfYear: number;
  readonly days: readonly (readonly [Temporal.PlainDate, Time[]])[];
  userId: UserId;
};

function Week(properties: VoidProps<WeekProperties>) {
  const { t, locale } = useI18n();
  const durationFormatter = createMemo(
    () =>
      new Intl.DurationFormat(locale(), {
        style: "digital",
        hours: "2-digit",
        minutes: "2-digit",
      }),
  );

  const totalDuration = createMemo(() =>
    properties.days
      .values()
      .flatMap(([, times]) => times)
      .reduce(
        (total, time) => total.add(time.end.since(time.start)),
        Temporal.Duration.from({ milliseconds: 0 }),
      )
      .round({ smallestUnit: "minute", largestUnit: "hour" }),
  );

  return (
    <section>
      <header class="text-on-surface-variant mb-2 flex items-center justify-between px-1">
        <h2 class="text-headline-lg">
          {t("times-calendar-week", { week: properties.weekOfYear })}
        </h2>
        <time datetime={totalDuration().toString()} class="text-headline-md">
          {durationFormatter().format(totalDuration())}
        </time>
      </header>
      <ol class="flex flex-col gap-4">
        <For each={properties.days}>
          {([day, times]) => (
            <li>
              <Day day={day} times={times} userId={properties.userId} />
            </li>
          )}
        </For>
      </ol>
    </section>
  );
}

function Times() {
  const routeData = Route.useLoaderData();
  const { t } = useI18n();

  const timesQuery = useInfiniteQuery(() => query(routeData().userId));

  const weeks = () => {
    if (timesQuery.status !== "success") return;

    const allTimes = timesQuery.data.pages.flat();

    const timesByDate = Map.groupBy(allTimes, (time) =>
      time.start.toZonedDateTimeISO(timeZone).toPlainDate().toString(),
    );

    const days = timesByDate
      .entries()
      .map(([day, times]) => [Temporal.PlainDate.from(day), times] as const);

    const daysByWeek = Map.groupBy(days, ([day]) => {
      const week = day.weekOfYear;
      const year = day.yearOfWeek;
      return `${year}-${String(week).padStart(2, "0")}`;
    });

    return daysByWeek
      .entries()
      .map(([key, days]) => ({ key, weekOfYear: days[0][0].weekOfYear!, days }))
      .toArray()
      .sort((left, right) => right.key.localeCompare(left.key));
  };

  let sentinel!: HTMLDivElement;
  onMount(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && timesQuery.hasNextPage && !timesQuery.isFetchingNextPage) {
          void timesQuery.fetchNextPage();
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(sentinel);
    onCleanup(() => observer.disconnect());
  });

  return (
    <>
      <Title title={t("times-title")} />
      <FloatingActionButton to="/times/new" label={t("times-log-time")} icon="add" />
      <main class="grid content-start gap-y-6 overflow-y-auto px-4 py-4">
        <For each={weeks()}>
          {(week) => (
            <Week weekOfYear={week.weekOfYear} days={week.days} userId={routeData().userId} />
          )}
        </For>
        <div ref={sentinel} />
        <Show when={timesQuery.isFetchingNextPage}>
          <p class="text-on-surface-variant py-4 text-center">{t("times-loading-more")}</p>
        </Show>
      </main>
    </>
  );
}

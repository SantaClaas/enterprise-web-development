import { useMutation, useQuery } from "@tanstack/solid-query";
import { createFileRoute, Link } from "@tanstack/solid-router";
import { createSignal, For, type VoidProps } from "solid-js";

import Icon from "@/Icon";
import { query, type Time, type TimeId } from "@/time";
import { Title } from "@/Title";
import { idQuery, type UserId } from "@/user";

// Assume time zone does not change during the runtime of the application
const timeZone = Temporal.Now.timeZoneId();

export const Route = createFileRoute("/_app/times/")({
  component: Times,
  async loader({ context: { queryClient } }) {
    const userId = await queryClient.ensureQueryData(idQuery);

    const response = await fetch(`/api/users/${userId}/times`);
    const times: Time[] = await response.json();
    for (const time of times) {
      time.start = Temporal.Instant.from(time.start);
      time.end = Temporal.Instant.from(time.end);
    }

    const timesByDate = Map.groupBy(times, (time) => {
      return time.start.toZonedDateTimeISO(timeZone).toPlainDate().toString();
    });

    return {
      userId,
      times: timesByDate
        .entries()
        .map(([day, times]) => {
          return [Temporal.PlainDate.from(day), times] as const;
        })
        .toArray(),
    };
  },
});

type DayProperties = {
  day: Temporal.PlainDate;
  times: Time[];
  userId: UserId;
};

const today = Temporal.Now.plainDateISO();

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  weekday: "long",
  month: "long",
  day: "numeric",
});

const timeFormatter = new Intl.DateTimeFormat(undefined, {
  hour: "2-digit",
  minute: "2-digit",
});

const durationFormatter = new Intl.DurationFormat(undefined, {
  style: "digital",
  // hoursDisplay: "always",
  // minutesDisplay: "always",
  hours: "2-digit",
  minutes: "2-digit",
});

function Day(properties: VoidProps<DayProperties>) {
  // Could do this with a custom styled checkbox and no JS
  const [isEdit, setIsEdit] = createSignal(false);

  function cancelEdit() {
    setIsEdit(false);
  }

  const dayId = properties.day.toString();
  const editFormId = "edit-" + dayId;

  type UpdateParameters = {
    userId: UserId;
    times: Time[];
  };

  // TODO optimistic update
  const updateMutation = useMutation(() => ({
    async mutationFn({ userId, times }: UpdateParameters) {
      const response = await fetch(`/api/users/${userId}/times`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(times),
      });

      if (!response.ok) throw new Error("Error updating times");
    },
    onSettled(_data, _error, variables, _result, context) {
      setIsEdit(false);
      context.client.invalidateQueries({ queryKey: query(variables.userId).queryKey, exact: true });
    },
  }));

  const TIME_PREFIX = "time-";
  function handleEditSubmit(event: SubmitEvent & { currentTarget: HTMLFormElement }) {
    const times: Time[] = [];
    for (const element of event.currentTarget.elements) {
      if (!(element instanceof HTMLFieldSetElement)) continue;

      const timeIdInput = element.elements.namedItem("time-id") as HTMLInputElement;

      const timeId = timeIdInput.value;
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
        id: timeId as TimeId,
        start: startInstant,
        end: endInstant,
      });
    }

    updateMutation.mutate({
      userId: properties.userId,
      times,
    });
  }

  return (
    <>
      <article
        data-is-edit={isEdit() ? "" : undefined}
        data-is-today={properties.day.equals(today) ? "" : undefined}
        class="bg-surface-container data-is-today:bg-primary-container text-on-surface fill-on-surface data-is-today:text-on-primary-container data-is-today:fill-on-primary rounded-large group relative grid grid-cols-[1fr_1fr_auto_auto] gap-2 p-4"
      >
        <h2 class="text-headline-md col-span-2">{dateFormatter.format(properties.day)}</h2>
        <button
          onClick={() => setIsEdit(!isEdit())}
          class="icon-button fill-on-surface group-data-is-edit:hidden"
        >
          <span class="sr-only">Edit</span>
          <Icon name="edit" class="size-6" />
        </button>

        <button
          type="submit"
          form={editFormId}
          disabled={updateMutation.isPending}
          class="icon-button fill-on-surface hidden group-data-is-edit:block"
        >
          <span class="sr-only">Save</span>
          <Icon name="save" class="size-6" />
        </button>

        <button
          onClick={cancelEdit}
          disabled={updateMutation.isPending}
          class="icon-button fill-on-surface hidden group-data-is-edit:block"
        >
          <span class="sr-only">Cancel</span>
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
                    {timeFormatter.format(time.start)}
                  </time>
                  <time datetime={time.end.toString()} class="bg-surface rounded-full p-2">
                    {timeFormatter.format(time.end)}
                  </time>
                  <time datetime={duration.toString()} class="bg-surface rounded-full p-2">
                    {durationFormatter.format(duration)}
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

              const formattedNewDuration = () => durationFormatter.format(newDuration());

              return (
                <fieldset
                  id={`${TIME_PREFIX}-${time.id}`}
                  disabled={updateMutation.isPending}
                  class="rounded-medium col-span-full grid grid-cols-3 gap-3 p-2"
                >
                  <input type="hidden" name="time-id" value={time.id} />
                  <label for={`start-${time.id}`} class="sr-only">
                    Start time
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
                    End time
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

                  <time datetime={duration.toString()} class="bg-surface rounded-full p-2">
                    {formattedNewDuration()}
                  </time>
                </fieldset>
              );
            }}
          </For>
        </form>
      </article>
    </>
  );
}

function Times() {
  const routeData = Route.useLoaderData();

  // const timesByDate = Map.groupBy(times, (time) => {
  //   return time.start.toZonedDateTimeISO(timeZone).toPlainDate().toString();
  // });

  // return {
  //   userId,
  //   times: timesByDate
  //     .entries()
  //     .map(([day, times]) => {
  //       return [Temporal.PlainDate.from(day), times] as const;
  //     })
  //     .toArray(),
  // };

  const timesQuery = useQuery(() => query(routeData().userId));
  const times = () => {
    if (timesQuery.status !== "success") return;

    const timesByDate = Map.groupBy(timesQuery.data, (time) => {
      return time.start.toZonedDateTimeISO(timeZone).toPlainDate().toString();
    });

    return timesByDate
      .entries()
      .map(([day, times]) => {
        return [Temporal.PlainDate.from(day), times] as const;
      })
      .toArray();
  };

  return (
    <>
      <Link to="/times/new" class="floating-action-button bottom-22">
        <span class="sr-only">Log time</span>
        <Icon name="add" class="fill-on-primary size-6" />
      </Link>
      <Title title="Times" />
      <main class="grid h-min gap-y-4 px-4">
        <For each={times()}>
          {([day, timesForDay]) => (
            <Day userId={routeData().userId} day={day} times={timesForDay} />
          )}
        </For>
      </main>
    </>
  );
}

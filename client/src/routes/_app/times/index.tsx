import { createFileRoute, Link } from "@tanstack/solid-router";
import { For, type VoidProps } from "solid-js";

import Icon from "../../../Icon";
import { Title } from "../../../Title";
import { idQuery } from "../../../user";

type Time = {
  id: string;
  start: Temporal.Instant;
  end: Temporal.Instant;
};
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

    const timeZone = Temporal.Now.timeZoneId();
    const timesByDate = Map.groupBy(times, (time) => {
      return time.start.toZonedDateTimeISO(timeZone).toPlainDate().toString();
    });

    return timesByDate
      .entries()
      .map(([day, times]) => {
        return [Temporal.PlainDate.from(day), times] as const;
      })
      .toArray();
  },
});

type DayProperties = {
  day: Temporal.PlainDate;
  times: Time[];
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
  return (
    <>
      <article
        data-is-today={properties.day.equals(today) ? "" : undefined}
        class="bg-surface-container data-is-today:bg-primary-container text-on-surface data-is-today:text-on-primary-container rounded-large relative grid grid-cols-[1fr_1fr_auto] gap-2 p-4"
      >
        <h2 class="text-headline-md col-span-full">{dateFormatter.format(properties.day)}</h2>
        <ol class="contents">
          <For each={properties.times}>
            {(time) => {
              const duration = time.end
                .since(time.start)
                .round({ smallestUnit: "minute", largestUnit: "hour" });

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
      </article>
    </>
  );
}

function Times() {
  const times = Route.useLoaderData();

  console.debug("Times loaded", times());
  return (
    <>
      <Link to="/times/new" class="floating-action-button bottom-22">
        <span class="sr-only">Log time</span>
        <Icon name="add" class="fill-on-primary size-6" />
      </Link>
      <Title title="Times" />
      <main class="grid h-min gap-y-4 px-4">
        <For each={times()}>{([day, timesForDay]) => <Day day={day} times={timesForDay} />}</For>
      </main>
    </>
  );
}

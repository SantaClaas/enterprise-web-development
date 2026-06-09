import { createFileRoute, Link } from "@tanstack/solid-router";
import type { VoidProps } from "solid-js";

import Icon from "../../../Icon";
import { Title } from "../../../Title";

export const Route = createFileRoute("/_app/times/")({
  component: Times,
});

type DayProperties = {
  day: Temporal.PlainDate;
};

const today = Temporal.Now.plainDateISO();

const dayFormatter = new Intl.DateTimeFormat(undefined, { weekday: "long" });

function Day(properties: VoidProps<DayProperties>) {
  return (
    <>
      <Link to="/times/new" class="floating-action-button bottom-22">
        <span class="sr-only">Log time</span>
        <Icon name="add" class="fill-on-primary size-6" />
      </Link>
      <section
        data-is-today={properties.day.equals(today) ? "" : undefined}
        class="bg-surface-container data-is-today:bg-primary-container text-on-surface data-is-primary:text-on-primary-container rounded-large relative grid grid-cols-[1fr_1fr_auto] gap-2 p-4"
      >
        <h2 class="text-headline-md">{dayFormatter.format(properties.day)}</h2>
        {/* TODO replace divs */}
        <div class="col-span-3 mt-2 grid grid-cols-subgrid items-center">
          <span class="bg-surface text-body-lg inline-block w-full rounded-full px-4 py-3">
            12:00
          </span>
          <span class="bg-surface text-body-lg inline-block w-full rounded-full px-4 py-3">
            13:00
          </span>
          <button
            type="submit"
            class="relative col-start-3 w-min rounded-full p-3 before:absolute before:top-1/2 before:left-1/2 before:size-[max(100%,44px)] before:-translate-1/2 pointer-fine:before:hidden"
          >
            <Icon name="edit" class="fill-on-surface-variant size-6" />
            <span class="sr-only">Sign out</span>
          </button>
        </div>
        <form class="col-span-3 grid grid-cols-subgrid">
          <label for="start" class="text-label-lg">
            <span class="sr-only">Start</span>
            <input
              type="time"
              id="start"
              name="start"
              class="bg-surface text-body-lg w-full rounded-full px-4 py-3"
            />
          </label>
          <label for="end" class="text-label-lg">
            <span class="sr-only">End</span>
            <input
              type="time"
              id="end"
              name="end"
              class="bg-surface text-body-lg w-full rounded-full px-4 py-3"
            />
          </label>
          <button
            type="submit"
            class="bg-primary-container relative col-start-3 w-min rounded-full p-3 before:absolute before:top-1/2 before:left-1/2 before:size-[max(100%,44px)] before:-translate-1/2 pointer-fine:before:hidden"
          >
            <Icon name="add" class="fill-on-primary-container size-6" />
            <span class="sr-only">Add time</span>
          </button>
        </form>
      </section>
    </>
  );
}
function Times() {
  return (
    <>
      <Title title="Times" />
      <main class="grid h-min gap-y-4 px-4">
        <Day day={Temporal.Now.plainDateISO()} />
        <Day day={Temporal.Now.plainDateISO().add({ days: 1 })} />
      </main>
    </>
  );
}

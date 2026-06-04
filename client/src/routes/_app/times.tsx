import { createFileRoute } from "@tanstack/solid-router";

import Icon from "../../Icon";

export const Route = createFileRoute("/_app/times")({
  component: Times,
});

function Times() {
  return (
    <main class="px-4">
      <section class="bg-surface-container rounded-large grid grid-cols-[1fr_1fr_auto] gap-y-2 p-4">
        {/* TODO replace divs */}
        <div class="col-span-3 grid grid-cols-subgrid items-center">
          <span class="bg-surface text-body-lg inline-block w-min rounded-full px-4 py-3">
            12:00
          </span>
          <span class="bg-surface text-body-lg inline-block w-min rounded-full px-4 py-3">
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
              class="bg-surface text-body-lg rounded-full px-4 py-3"
            />
          </label>
          <label for="end" class="text-label-lg">
            <span class="sr-only">End</span>
            <input
              type="time"
              id="end"
              name="end"
              class="bg-surface text-body-lg rounded-full px-4 py-3"
            />
          </label>
          <button
            type="submit"
            class="bg-primary-container relative col-start-3 w-min rounded-full p-3 before:absolute before:top-1/2 before:left-1/2 before:size-[max(100%,44px)] before:-translate-1/2 pointer-fine:before:hidden"
          >
            <Icon name="add" class="fill-on-primary-container size-6" />
            <span class="sr-only">Sign out</span>
          </button>
        </form>
      </section>
    </main>
  );
}

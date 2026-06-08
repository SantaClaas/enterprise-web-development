import { createFileRoute, Link } from "@tanstack/solid-router";

import Body from "../../Body";
import Icon from "../../Icon";

export const Route = createFileRoute("/times/new")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <Body class="bg-surface-container-high text-on-surface grid h-dvh grid-rows-[auto_1fr_auto]">
        <header class="bg-surface-container-high text-on-surface flex py-1">
          <Link to="/times" class="cursor-default p-4">
            <span class="sr-only">Discard</span>
            <Icon name="close" class="fill-on-surface size-6" />
          </Link>
          <h1 class="text-title-lg content-center">Log new time</h1>
        </header>
        <main class="h-min">
          <form id="time" class="grid h-full grid-cols-2 gap-x-4 p-6">
            {/* TODO same day toggle */}
            {/* TODO form validation start < end */}
            <label for="date" class="text-label-lg text-on-surface-variant col-span-2 block">
              Date
            </label>
            <input
              type="date"
              id="date"
              name="date"
              value={Temporal.Now.plainDateISO().toString()}
              required
              class="text-field col-span-2 mt-1 w-full"
            />

            <label for="start" class="text-label-lg text-on-surface-variant row-start-3 mt-4 block">
              Start
            </label>
            <input
              type="time"
              id="start"
              name="start"
              required
              class="text-field row-start-4 mt-1 w-full"
            />

            <label for="end" class="text-label-lg text-on-surface-variant row-start-3 mt-4 block">
              End
            </label>
            <input
              type="time"
              id="end"
              name="end"
              required
              value={Temporal.Now.plainTimeISO().toString().substring(0, 5)}
              class="text-field row-start-4 mt-1 w-full"
            />
          </form>
        </main>
        <footer class="mt-6 grid grid-cols-2 gap-4 px-6 py-4">
          <Link to="/times" data-variant="outlined" class="button">
            Cancel
          </Link>

          <button type="submit" form="time" data-variant="primary" class="button">
            Save
          </button>
        </footer>
      </Body>
    </>
  );
}

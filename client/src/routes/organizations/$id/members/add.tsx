import { createFileRoute, Link } from "@tanstack/solid-router";

import Body from "../../../../Body";
import Icon from "../../../../Icon";

export const Route = createFileRoute("/organizations/$id/members/add")({
  component: RouteComponent,
});

function RouteComponent() {
  const parameters = Route.useParams();
  return (
    <>
      <Body class="bg-surface-container-high text-on-surface grid h-dvh grid-rows-[auto_1fr_auto]">
        <header class="bg-surface-container-high text-on-surface flex py-1">
          <Link to="/organizations/$id/members" params={parameters} class="cursor-default p-4">
            <span class="sr-only">Discard</span>
            <Icon name="close" class="fill-on-surface size-6" />
          </Link>
          <h1 class="text-title-lg content-center">Add member</h1>
        </header>
        <main class="h-min">
          <form id="time" class="grid h-full grid-cols-2 gap-x-4 p-6">
            <label for="Username" class="text-label-lg text-on-surface-variant col-span-2 block">
              Username
            </label>
            <input
              type="text"
              id="Username"
              name="Username"
              required
              class="text-field col-span-2 mt-1 w-full"
            />
          </form>
        </main>
        <footer class="mt-6 grid grid-cols-2 gap-4 px-6 py-4">
          <Link
            to="/organizations/$id/members"
            params={parameters}
            data-variant="outlined"
            class="button"
          >
            Cancel
          </Link>

          <button type="submit" form="time" data-variant="filled" class="button">
            Add
          </button>
        </footer>
      </Body>
    </>
  );
}

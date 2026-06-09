import { createFileRoute, Link, useNavigate } from "@tanstack/solid-router";
import { For } from "solid-js";

import Body from "../../Body";
import Icon from "../../Icon";
import { useOrganizations } from "../../useOrganizations";
import { useUserContext } from "../../userContext";

export const Route = createFileRoute("/projects/new")({
  component: RouteComponent,
});

function RouteComponent() {
  const userContext = useUserContext();
  const organizations = useOrganizations();
  const navigate = useNavigate();

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();

    const form = event.currentTarget as HTMLFormElement;
    const nameInput = form.elements.namedItem("name") as HTMLInputElement;
    const name = nameInput.value;
    const organizationSelect = form.elements.namedItem("organization") as HTMLSelectElement;
    const organizationId = organizationSelect.value;

    const userId = await userContext.getUserId;
    //TODO change the endpoint to just accept text/plain with the new project name as that is all that is required
    const response = await fetch(`/api/users/${userId}/organizations/${organizationId}/projects`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
      }),
    });

    if (!response.ok) {
      // TODO error handling
      console.error("Error creating project", await response.text());
      return;
    }

    navigate({ to: "/projects" });
  }

  return (
    <Body class="bg-surface-container-high text-on-surface grid h-dvh grid-rows-[auto_1fr_auto]">
      <header class="bg-surface-container-high text-on-surface flex py-1">
        <Link to="/projects" class="cursor-default p-4">
          <span class="sr-only">Discard</span>
          <Icon name="close" class="fill-on-surface size-6" />
        </Link>
        <h1 class="text-title-lg content-center">New Project</h1>
      </header>
      <main class="h-min">
        <form id="project" onSubmit={handleSubmit} class="grid h-full grid-cols-2 gap-x-4 p-6">
          {/* TODO same day toggle */}
          {/* TODO form validation start < end */}
          <label for="name" class="text-label-lg text-on-surface-variant col-span-2 block">
            Name
          </label>
          <input type="text" id="name" required class="text-field col-span-2 mt-1 w-full" />

          <label
            for="organization"
            class="text-label-lg text-on-surface-variant row-start-3 mt-4 block"
          >
            Organization
          </label>
          <select id="organization" required class="text-field col-span-2 mt-1 w-full">
            {/* TODO disable submit while loading organizations */}
            <For
              each={organizations()}
              fallback={
                <option value="" disabled>
                  Loading...
                </option>
              }
            >
              {(organization) => <option value={organization.id}>{organization.name}</option>}
            </For>
          </select>
        </form>
      </main>
      <footer class="mt-6 grid grid-cols-2 gap-4 px-6 py-4">
        <Link to="/projects" data-variant="outlined" class="button">
          Cancel
        </Link>

        <button type="submit" form="project" data-variant="primary" class="button">
          Create
        </button>
      </footer>
    </Body>
  );
}

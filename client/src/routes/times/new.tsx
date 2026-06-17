import { useQuery, useQueryClient } from "@tanstack/solid-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/solid-router";
import { For, Suspense } from "solid-js";

import Body from "../../Body";
import Icon from "../../Icon";
import { isProject, query } from "../../project";
import { idQuery } from "../../user";

export const Route = createFileRoute("/times/new")({
  component: RouteComponent,
});

// Assume this doesn't change for the runtime of the application
const timeZone = Temporal.Now.timeZoneId();

function RouteComponent() {
  const userId = useQuery(() => idQuery);
  const projects = useQuery(() => query(userId.data));
  const queryClient = useQueryClient();

  const navigate = useNavigate();

  function extractValues(form: HTMLFormElement) {
    const dateInput = form.elements.namedItem("date") as HTMLInputElement;
    const date = Temporal.PlainDate.from(dateInput.value);
    console.debug("Date", date);

    const startInput = form.elements.namedItem("start") as HTMLInputElement;
    const startTime = Temporal.PlainTime.from(startInput.value);
    const start = date.toZonedDateTime({
      plainTime: startTime,
      timeZone,
    });
    const endInput = form.elements.namedItem("end") as HTMLInputElement;

    const endTime = Temporal.PlainTime.from(endInput.value);
    const end = date.toZonedDateTime({
      plainTime: endTime,
      timeZone,
    });

    return { start, end, startInput, endInput };
  }
  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();

    const form = event.currentTarget as HTMLFormElement;

    const { start, end } = extractValues(form);
    const projectSelect = form.elements.namedItem("project") as HTMLSelectElement;
    const projectId = projectSelect.value;

    const userId = await queryClient.fetchQuery(idQuery);
    const response = await fetch(`/api/users/${userId}/projects/${projectId}/times`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        // Help poor Java parse the time by removing the time zone name
        start: start.toString({ timeZoneName: "never" }),
        end: end.toString({ timeZoneName: "never" }),
      }),
    });

    if (!response.ok) {
      // TODO error handling
      console.error("Error creating time entry", await response.text());
      return;
    }

    navigate({ to: "/times" });
  }

  const selectableProjects = () => projects.data?.filter(isProject);

  function handleInput(event: InputEvent) {
    const input = event.currentTarget as HTMLInputElement;
    const isStart = input.name === "start";
    const { start, end, startInput, endInput } = extractValues(input.form!);

    if (isStart && Temporal.ZonedDateTime.compare(start, end) >= 0) {
      startInput.setCustomValidity("Start time must be before end time.");
      return;
    } else {
      startInput.setCustomValidity("");
    }

    if (!isStart && Temporal.ZonedDateTime.compare(end, start) >= 0) {
      endInput.setCustomValidity("Start time must be before end time.");
      return;
    } else {
      endInput.setCustomValidity("");
    }
  }
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
          <form id="time" onSubmit={handleSubmit} class="grid h-full grid-cols-2 gap-x-4 p-6">
            {/* TODO same day toggle */}
            {/* TODO form validation start < end */}
            <label for="date" class="text-label-lg text-on-surface-variant col-span-full block">
              Date
            </label>
            <input
              type="date"
              id="date"
              name="date"
              value={Temporal.Now.plainDateISO().toString()}
              required
              class="text-field col-span-full mt-1 w-full"
            />

            <label for="start" class="text-label-lg text-on-surface-variant row-start-3 mt-4 block">
              Start
            </label>
            <input
              type="time"
              id="start"
              name="start"
              required
              onInput={handleInput}
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
              onInput={handleInput}
              value={Temporal.Now.plainTimeISO().toString().substring(0, 5)}
              class="text-field row-start-4 mt-1 w-full"
            />
            <label
              for="project"
              class="text-label-lg text-on-surface-variant col-span-full mt-4 block"
            >
              Project
            </label>
            <select
              id="project"
              name="project"
              required
              class="text-field col-span-full mt-1 w-full"
            >
              <Suspense fallback={<option disabled>Loading projects...</option>}>
                <For each={selectableProjects()}>
                  {(project) => <option value={project.id}>{project.name}</option>}
                </For>
              </Suspense>
            </select>
          </form>
        </main>
        <footer class="mt-6 grid grid-cols-2 gap-4 px-6 py-4">
          <Link to="/times" data-variant="outlined" class="button">
            Cancel
          </Link>

          <button
            type="submit"
            form="time"
            data-variant="filled"
            disabled={projects.isLoading}
            class="button"
          >
            Save
          </button>
        </footer>
      </Body>
    </>
  );
}

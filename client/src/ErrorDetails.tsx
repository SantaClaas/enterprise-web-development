import type { ErrorComponentProps } from "@tanstack/solid-router";
import { Show } from "solid-js";

export function ErrorDetails(
  properties: ErrorComponentProps & { title: string; explainer: string },
) {
  return (
    <>
      <article class="bg-error-container text-on-error-container grid grid-cols-[1fr_auto] rounded p-6">
        <h2 class="text-title-lg col-span-full">{properties.title}</h2>
        <p class="text-body-lg col-span-full mt-2">{properties.explainer}</p>

        <Show when={properties.error || properties.info}>
          <details class="col-span-full mt-4">
            <summary>Technical details</summary>

            <Show when={properties.error}>
              <pre>{properties.error.stack}</pre>
            </Show>
            <Show when={properties.info}>
              <pre>{JSON.stringify(properties.info, null, 2)}</pre>
            </Show>
          </details>
        </Show>

        <button
          onClick={properties.reset}
          class="text-label-lg text-on-error-container col-start-2"
        >
          Retry
        </button>
      </article>
    </>
  );
}

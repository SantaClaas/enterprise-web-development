import type { ErrorComponentProps } from "@tanstack/solid-router";
import { Show } from "solid-js";

import { useI18n } from "./i18n";

export function ErrorDetails(
  properties: ErrorComponentProps & { title: string; explainer: string },
) {
  // Log the error so we can view it in the console and it doesn't get swallowed
  console.error("ErrorDetails", properties.error);
  const { t } = useI18n();
  return (
    <>
      <article class="bg-error-container text-on-error-container mx-auto mt-6 grid max-w-2xl grid-cols-[1fr_auto] rounded p-6">
        <h2 class="text-title-lg col-span-full">{properties.title}</h2>
        <p class="text-body-lg col-span-full mt-2">{properties.explainer}</p>

        <Show when={properties.error || properties.info}>
          <details class="col-span-full mt-4">
            <summary>{t("error-technical-details")}</summary>

            <Show when={properties.error}>
              <pre class="overflow-x-scroll">{properties.error.stack}</pre>
            </Show>
            <Show when={properties.info}>
              <pre class="overflow-x-scroll">{JSON.stringify(properties.info, null, 2)}</pre>
            </Show>
          </details>
        </Show>

        <button
          onClick={properties.reset}
          class="text-label-lg text-on-error-container col-start-2"
        >
          {t("error-retry")}
        </button>
      </article>
    </>
  );
}

import { useQuery, useQueryClient } from "@tanstack/solid-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/solid-router";
import { For, Suspense } from "solid-js";

import Body from "@/components/Body";
import Icon from "@/components/Icon";

import { useI18n } from "../../i18n";
import { isOrganization, query } from "../../organization";
import { idQuery } from "../../user";

export const Route = createFileRoute("/projects/new")({
  component: RouteComponent,
});

function RouteComponent() {
  const userIdQuery = useQuery(() => idQuery);
  const organizations = useQuery(() => query(userIdQuery.data));
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t } = useI18n();

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();

    const form = event.currentTarget as HTMLFormElement;
    const nameInput = form.elements.namedItem("name") as HTMLInputElement;
    const name = nameInput.value;
    const organizationSelect = form.elements.namedItem("organization") as HTMLSelectElement;
    const organizationId = organizationSelect.value;

    //TODO there is probably a better way to combine this with the same query usage above
    const userId = await queryClient.fetchQuery(idQuery);
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

  const selectableOrganizations = () => organizations.data?.filter(isOrganization);

  return (
    <Body class="bg-surface-container-high text-on-surface grid h-dvh grid-rows-[auto_1fr_auto]">
      <header class="bg-surface-container-high text-on-surface flex py-1">
        <Link to="/projects" class="cursor-default p-4">
          <span class="sr-only">{t("project-new-discard")}</span>
          <Icon name="close" class="fill-on-surface size-6" />
        </Link>
        <h1 class="text-title-lg content-center">{t("project-new-title")}</h1>
      </header>
      <main class="h-min">
        <form id="project" onSubmit={handleSubmit} class="grid h-full grid-cols-2 gap-x-4 p-6">
          {/* TODO same day toggle */}
          {/* TODO form validation start < end */}
          <label for="name" class="text-label-lg text-on-surface-variant col-span-2 block">
            {t("project-new-name-label")}
          </label>
          <input type="text" id="name" required class="text-field col-span-2 mt-1 w-full" />

          <label
            for="organization"
            class="text-label-lg text-on-surface-variant row-start-3 mt-4 block"
          >
            {t("project-new-organization-label")}
          </label>
          <select id="organization" required class="text-field col-span-2 mt-1 w-full">
            <Suspense
              fallback={
                <option value="" disabled>
                  {t("project-new-loading")}
                </option>
              }
            >
              <For each={selectableOrganizations()}>
                {(organization) => <option value={organization.id}>{organization.name}</option>}
              </For>
            </Suspense>
          </select>
        </form>
      </main>
      <footer class="mt-6 grid grid-cols-2 gap-4 px-6 py-4">
        <Link to="/projects" data-variant="outlined" class="button">
          {t("project-new-cancel")}
        </Link>

        <button
          type="submit"
          form="project"
          disabled={organizations.isLoading}
          data-variant="filled"
          class="button"
        >
          {t("project-new-create")}
        </button>
      </footer>
    </Body>
  );
}

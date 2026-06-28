import { useMutation, useQuery, useQueryClient } from "@tanstack/solid-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/solid-router";
import { For, Suspense } from "solid-js";

import Body from "../../Body";
import Icon from "../../Icon";
import { useI18n } from "../../i18n";
import {
  query as organizationQuery,
  isOrganization,
  type Id as OrganizationId,
} from "../../organization";
import { query, updateProject, type Id as ProjectId } from "../../project";
import { idQuery } from "../../user";

export const Route = createFileRoute("/projects/$id/edit")({
  component: RouteComponent,
  async loader({ context }) {
    const userId = await context.queryClient.ensureQueryData(idQuery);
    return { userId };
  },
  validateSearch(search) {
    if (
      search.name &&
      typeof search.name === "string" &&
      search.organizationId &&
      typeof search.organizationId === "string"
    )
      return { name: search.name, organizationId: search.organizationId };

    return {};
  },
});

function RouteComponent() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const search = Route.useSearch();
  const loaderData = Route.useLoaderData();
  const parameters = Route.useParams();
  const userIdQuery = useQuery(() => idQuery);
  const organizations = useQuery(() => organizationQuery(userIdQuery.data));
  const { t } = useI18n();

  const updateNameMutation = useMutation(() => ({
    mutationFn: updateProject,
    async onMutate(variables, context) {
      const userId = await context.client.fetchQuery(idQuery);
      const queryOptions = query(userId);
      // Cancel any outgoing refetches
      // (so they don't overwrite our optimistic update)
      await context.client.cancelQueries(queryOptions);

      // Snapshot the previous value
      const previous = context.client.getQueryData(queryOptions.queryKey);

      // Optimistically update to the new value
      context.client.setQueryData(queryOptions.queryKey, (old) => {
        const project = old?.find((project) => "id" in project && project.id === variables.id);
        if (project) {
          project.name = variables.name;
        }
        return old;
      });

      // Return the snapshotted value
      return { userId, previous };
    },

    async onError(_error, variables, onMutateResult, context) {
      context.client.setQueryData(query(onMutateResult?.userId).queryKey, onMutateResult?.previous);
      await navigate({
        to: "/projects/$id/edit",
        params: { id: variables.id },
        search: { name: variables.name, organizationId: variables.organizationId },
      });
    },
    async onSuccess(_data, _error, variables) {
      await queryClient.invalidateQueries({ queryKey: query(variables.userId).queryKey });
    },
  }));

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();

    const form = event.currentTarget as HTMLFormElement;
    const nameInput = form.elements.namedItem("name") as HTMLInputElement;
    const name = nameInput.value;
    const userId = loaderData().userId;
    const organizationSelect = form.elements.namedItem("organization") as HTMLSelectElement;
    const organizationId = organizationSelect.value as OrganizationId;
    //TODO find more elegant way to casting to ProjectId
    const id = parameters().id as ProjectId;
    updateNameMutation.mutate({ userId, id, name, organizationId });
    await navigate({ to: "/projects" });
  }

  const selectableOrganizations = () => organizations.data?.filter(isOrganization);

  return (
    <Body class="bg-surface-container-high text-on-surface grid h-dvh grid-rows-[auto_1fr_auto]">
      <header class="bg-surface-container-high text-on-surface flex py-1">
        <Link to="/projects" class="cursor-default p-4">
          <span class="sr-only">{t("project-edit-discard")}</span>
          <Icon name="close" class="fill-on-surface size-6" />
        </Link>
        <h1 class="text-title-lg content-center">{t("project-edit-title")}</h1>
      </header>
      <main class="h-min">
        <form id="project" onSubmit={handleSubmit} class="grid h-full grid-cols-2 gap-x-4 p-6">
          {/* TODO same day toggle */}
          {/* TODO form validation start < end */}
          <label for="name" class="text-label-lg text-on-surface-variant col-span-2 block">
            {t("project-edit-name-label")}
          </label>
          <input
            type="text"
            id="name"
            required
            value={search().name ?? ""}
            class="text-field col-span-2 mt-1 w-full"
          />
          <label
            for="organization"
            class="text-label-lg text-on-surface-variant row-start-3 mt-4 block"
          >
            {t("project-edit-organization-label")}
          </label>
          <select id="organization" required class="text-field col-span-2 mt-1 w-full">
            <Suspense
              fallback={
                <option value="" disabled>
                  {t("project-edit-loading")}
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
          {t("project-edit-cancel")}
        </Link>

        <button type="submit" form="project" data-variant="filled" class="button">
          {t("project-edit-save")}
        </button>
      </footer>
    </Body>
  );
}

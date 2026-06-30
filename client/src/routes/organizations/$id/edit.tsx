import { useMutation, useQueryClient } from "@tanstack/solid-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/solid-router";

import Body from "@/components/Body";
import Icon from "@/components/Icon";

import { useI18n } from "../../../i18n";
import { query, updateOrganizationName, type Id as OrganizationId } from "../../../organization";
import { idQuery, type UserId } from "../../../user";

export const Route = createFileRoute("/organizations/$id/edit")({
  component: RouteComponent,
  async loader({ context }) {
    const userId = await context.queryClient.ensureQueryData(idQuery);
    return { userId };
  },
  validateSearch(search) {
    if (search.name && typeof search.name === "string") return { name: search.name };

    return {};
  },
});

function RouteComponent() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const search = Route.useSearch();
  const loaderData = Route.useLoaderData();
  const parameters = Route.useParams();
  const { t } = useI18n();

  const updateNameMutation = useMutation(() => ({
    async mutationFn({ userId, id, name }: { userId: UserId; id: OrganizationId; name: string }) {
      await updateOrganizationName(userId, id, name);
    },
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
        const organization = old?.find(
          (organization) => "id" in organization && organization.id === variables.id,
        );
        if (organization) {
          organization.name = variables.name;
        }
        return old;
      });

      // Return the snapshotted value
      return { userId, previous };
    },

    async onError(_error, variables, onMutateResult, context) {
      context.client.setQueryData(query(onMutateResult?.userId).queryKey, onMutateResult?.previous);
      await navigate({
        to: "/organizations/$id/edit",
        params: { id: variables.id },
        search: { name: variables.name },
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
    //TODO find more elegant way to casting to OrganizationId
    updateNameMutation.mutate({ userId, id: parameters().id as OrganizationId, name });
    await navigate({ to: "/organizations" });
  }

  return (
    <Body class="bg-surface-container-high text-on-surface grid h-dvh grid-rows-[auto_1fr_auto]">
      <header class="bg-surface-container-high text-on-surface flex py-1">
        <Link to="/organizations" class="cursor-default p-4">
          <span class="sr-only">{t("org-edit-discard")}</span>
          <Icon name="close" class="fill-on-surface size-6" />
        </Link>
        <h1 class="text-title-lg content-center">{t("org-edit-title")}</h1>
      </header>
      <main class="h-min">
        <form id="organization" onSubmit={handleSubmit} class="grid h-full grid-cols-2 gap-x-4 p-6">
          {/* TODO same day toggle */}
          {/* TODO form validation start < end */}
          <label for="name" class="text-label-lg text-on-surface-variant col-span-2 block">
            {t("org-edit-name-label")}
          </label>
          <input
            type="text"
            id="name"
            required
            value={search().name ?? ""}
            class="text-field col-span-2 mt-1 w-full"
          />
        </form>
      </main>
      <footer class="mt-6 grid grid-cols-2 gap-4 px-6 py-4">
        <Link to="/organizations" data-variant="outlined" class="button">
          {t("org-edit-cancel")}
        </Link>

        <button type="submit" form="organization" data-variant="filled" class="button">
          {t("org-edit-save")}
        </button>
      </footer>
    </Body>
  );
}

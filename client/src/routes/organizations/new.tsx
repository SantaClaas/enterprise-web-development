import { useMutation, useQueryClient } from "@tanstack/solid-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/solid-router";

import Body from "@/components/Body";
import Icon from "@/components/Icon";

import { useI18n } from "../../i18n";
import { createOrganization, query } from "../../organization";
import { idQuery } from "../../user";

export const Route = createFileRoute("/organizations/new")({
  validateSearch(search) {
    if (search.name && typeof search.name === "string") return { name: search.name };

    return {};
  },
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const search = Route.useSearch();
  const { t } = useI18n();

  const createMutation = useMutation(() => ({
    async mutationFn(name: string, context) {
      const userId = await context.client.fetchQuery(idQuery);
      await createOrganization(userId, name);
    },
    onMutate: async (variables, context) => {
      const userId = await context.client.fetchQuery(idQuery);
      const queryOptions = query(userId);
      // Cancel any outgoing refetches
      // (so they don't overwrite our optimistic update)
      await context.client.cancelQueries(queryOptions);

      // Snapshot the previous value
      const previous = context.client.getQueryData(queryOptions.queryKey);

      // Optimistically update to the new value
      context.client.setQueryData(queryOptions.queryKey, (old) => {
        if (!Array.isArray(old)) return [{ name: variables }];
        return [...old, { name: variables }];
      });

      // Return the snapshotted value
      return { userId, previous };
    },

    async onError(_error, name, onMutateResult, context) {
      context.client.setQueryData(query(onMutateResult?.userId).queryKey, onMutateResult?.previous);
      await navigate({ to: Route.fullPath, search: { name } });
    },
    async onSettled(_data, _error, _variables, context) {
      await queryClient.invalidateQueries({ queryKey: query(context?.userId).queryKey });
    },
  }));

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();

    const form = event.currentTarget as HTMLFormElement;
    const nameInput = form.elements.namedItem("name") as HTMLInputElement;
    const name = nameInput.value;
    createMutation.mutate(name);
    await navigate({ to: "/organizations" });
  }

  return (
    <Body class="bg-surface-container-high text-on-surface grid h-dvh grid-rows-[auto_1fr_auto]">
      <header class="bg-surface-container-high text-on-surface flex py-1">
        <Link to="/organizations" class="cursor-default p-4">
          <span class="sr-only">{t("org-new-discard")}</span>
          <Icon name="close" class="fill-on-surface size-6" />
        </Link>
        <h1 class="text-title-lg content-center">{t("org-new-title")}</h1>
      </header>
      <main class="h-min">
        <form id="organization" onSubmit={handleSubmit} class="grid h-full grid-cols-2 gap-x-4 p-6">
          {/* TODO same day toggle */}
          {/* TODO form validation start < end */}
          <label for="name" class="text-label-lg text-on-surface-variant col-span-2 block">
            {t("org-new-name-label")}
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
          {t("org-new-cancel")}
        </Link>

        <button type="submit" form="organization" data-variant="filled" class="button">
          {t("org-new-create")}
        </button>
      </footer>
    </Body>
  );
}

import { useMutation, useQueryClient } from "@tanstack/solid-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/solid-router";

import Body from "../../Body";
import Icon from "../../Icon";
import { query } from "../../organization";
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

  const createMutation = useMutation(() => ({
    async mutationFn(name: string, context) {
      const userId = await context.client.fetchQuery(idQuery);
      //TODO change the endpoint to just accept text/plain with the new organization name as that is all that is required
      const response = await fetch(`/api/users/${userId}/organizations`, {
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
        console.error("Error creating organization", await response.text());
        throw new Error("Failed to create organization. See console for more details.");
      }
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
      navigate({ to: Route.fullPath, search: { name } });
    },
  }));

  function handleSubmit(event: SubmitEvent) {
    event.preventDefault();

    const form = event.currentTarget as HTMLFormElement;
    const nameInput = form.elements.namedItem("name") as HTMLInputElement;
    const name = nameInput.value;
    createMutation.mutate(name);
  }

  return (
    <Body class="bg-surface-container-high text-on-surface grid h-dvh grid-rows-[auto_1fr_auto]">
      <header class="bg-surface-container-high text-on-surface flex py-1">
        <Link to="/organizations" class="cursor-default p-4">
          <span class="sr-only">Discard</span>
          <Icon name="close" class="fill-on-surface size-6" />
        </Link>
        <h1 class="text-title-lg content-center">New Organization</h1>
      </header>
      <main class="h-min">
        <form id="organization" onSubmit={handleSubmit} class="grid h-full grid-cols-2 gap-x-4 p-6">
          {/* TODO same day toggle */}
          {/* TODO form validation start < end */}
          <label for="name" class="text-label-lg text-on-surface-variant col-span-2 block">
            Name
          </label>
          <input type="text" id="name" required class="text-field col-span-2 mt-1 w-full" />
        </form>
      </main>
      <footer class="mt-6 grid grid-cols-2 gap-4 px-6 py-4">
        <Link to="/organizations" data-variant="outlined" class="button">
          Cancel
        </Link>

        <button type="submit" form="organization" data-variant="filled" class="button">
          Create
        </button>
      </footer>
    </Body>
  );
}

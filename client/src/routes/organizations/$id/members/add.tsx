import { createFileRoute, Link, useNavigate } from "@tanstack/solid-router";
import { createSignal } from "solid-js";

import Body from "@/components/Body";
import Icon from "@/components/Icon";

import { useI18n } from "../../../../i18n";
import { addMember, type Id as OrganizationId } from "../../../../organization";

export const Route = createFileRoute("/organizations/$id/members/add")({
  component: RouteComponent,
});

function RouteComponent() {
  const parameters = Route.useParams();
  const { t } = useI18n();
  const navigate = useNavigate();

  const [error, setError] = createSignal<string | null>(null);
  const [isPending, setIsPending] = createSignal(false);

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    const form = event.currentTarget as HTMLFormElement;
    const username = (form.elements.namedItem("Username") as HTMLInputElement).value.trim();

    setError(null);
    setIsPending(true);
    try {
      await addMember(parameters().id as OrganizationId, username);
      void navigate({ to: "/organizations/$id/members", params: parameters() });
    } catch {
      setError(t("org-add-member-error"));
    } finally {
      setIsPending(false);
    }
  }

  return (
    <>
      <Body class="bg-surface-container-high text-on-surface grid h-dvh grid-rows-[auto_1fr_auto]">
        <header class="bg-surface-container-high text-on-surface flex py-1">
          <Link to="/organizations/$id/members" params={parameters} class="cursor-default p-4">
            <span class="sr-only">{t("org-add-member-discard")}</span>
            <Icon name="close" class="fill-on-surface size-6" />
          </Link>
          <h1 class="text-title-lg content-center">{t("org-add-member-title")}</h1>
        </header>
        <main class="h-min">
          <form id="add-member" class="grid h-full grid-cols-2 gap-x-4 p-6" onSubmit={handleSubmit}>
            <label for="Username" class="text-label-lg text-on-surface-variant col-span-2 block">
              {t("org-add-member-username-label")}
            </label>
            <input
              type="text"
              id="Username"
              name="Username"
              required
              class="text-field col-span-2 mt-1 w-full"
            />
            {error() && <p class="text-error col-span-2 mt-2 text-sm">{error()}</p>}
          </form>
        </main>
        <footer class="mt-6 grid grid-cols-2 gap-4 px-6 py-4">
          <Link
            to="/organizations/$id/members"
            params={parameters}
            data-variant="outlined"
            class="button"
          >
            {t("org-add-member-cancel")}
          </Link>

          <button
            type="submit"
            form="add-member"
            data-variant="filled"
            class="button"
            disabled={isPending()}
          >
            {t("org-add-member-add")}
          </button>
        </footer>
      </Body>
    </>
  );
}

import { createFileRoute, Link, useRouter } from "@tanstack/solid-router";
import { useMutation, useQuery } from "@tanstack/solid-query";
import { For, Show, type ParentProps } from "solid-js";

import { ErrorDetails } from "../../../../ErrorDetails";
import Icon from "../../../../Icon";
import { useI18n } from "../../../../i18n";
import {
  changeMemberRole,
  removeMember,
  type Id as OrganizationId,
  type OrganizationRole,
} from "../../../../organization";
import { Title } from "../../../../Title";
import { TopAppBar } from "../../../../TopAppBar";
import { idQuery, type UserId } from "../../../../user";

type OrganizationMember = { id: UserId; name: string; username: string; role: OrganizationRole };
type Organization = {
  id: OrganizationId;
  name: string;
  users: OrganizationMember[];
};

function Page(properties: ParentProps<{ title: string }>) {
  const { t } = useI18n();
  return (
    <>
      <TopAppBar
        title={properties.title}
        leadingAction={
          <Link to="/organizations" data-position="leading" class="action-button">
            <Icon name="arrow-back" class="fill-on-surface size-6" />
            <span class="sr-only">{t("org-members-back")}</span>
          </Link>
        }
      />
      <main class="px-6">{properties.children}</main>
    </>
  );
}

export const Route = createFileRoute("/organizations/$id/members/")({
  component: RouteComponent,
  async loader({ params, abortController }) {
    const response = await fetch(`/api/organizations/${params.id}`, {
      method: "GET",
      signal: abortController.signal,
    });

    if (!response.ok)
      throw new Error(`Error fetching organization: ${response.status} ${await response.text()}`);

    return (await response.json()) as Organization;
  },
  // TODO error component, pending component
  errorComponent(properties) {
    const { t } = useI18n();
    return (
      <Page title={t("org-members-error-page-title")}>
        <ErrorDetails
          {...properties}
          title={t("org-members-error-title")}
          explainer={t("org-members-error-body")}
        />
      </Page>
    );
  },
});

function roleLabel(role: OrganizationRole, t: (key: string) => string): string {
  if (role === "OWNER") return t("org-role-owner");
  if (role === "ADMINISTRATOR") return t("org-role-administrator");
  return t("org-role-member");
}

function RouteComponent() {
  const organization = Route.useLoaderData();
  const { t } = useI18n();
  const params = Route.useParams();

  const router = useRouter();

  const currentUserIdQuery = useQuery(() => idQuery);
  const currentUserId = () => currentUserIdQuery.data;
  const currentUserRole = (): OrganizationRole | undefined =>
    organization().users.find((user) => user.id === currentUserId())?.role;

  const canManageMembers = () => {
    const role = currentUserRole();
    return role === "ADMINISTRATOR" || role === "OWNER";
  };
  const canChangeRoles = () => currentUserRole() === "OWNER";

  const deleteMutation = useMutation(() => ({
    mutationFn: (userId: UserId) => removeMember(params().id as OrganizationId, userId),
    async onSettled() {
      await router.invalidate();
    },
  }));

  const roleMutation = useMutation(() => ({
    mutationFn: ({ userId, role }: { userId: UserId; role: OrganizationRole }) =>
      changeMemberRole(params().id as OrganizationId, userId, role),
    async onSettled() {
      await router.invalidate();
    },
  }));

  return (
    <>
      <Title title={organization().name} />
      <Page title={organization().name}>
        <h2 class="text-headline-md">{t("org-members-users-heading")}</h2>
        {/* Expect an organization to have at least one user */}
        <ul class="mt-4 grid gap-2">
          <For each={organization().users}>
            {(user) => (
              <li class="text-title-lg bg-surface-container rounded-large grid grid-cols-[1fr_auto_auto] items-center gap-2 py-2 ps-6 pe-2">
                <span>
                  <span class="font-semibold">{user.name}</span>{" "}
                  <span>({user.username})</span>{" "}
                  <span class="text-label-md text-on-surface-variant">{roleLabel(user.role, t)}</span>
                </span>
                <Show when={canChangeRoles() && user.id !== currentUserId()}>
                  <select
                    class="text-field text-body-md"
                    value={user.role}
                    disabled={roleMutation.isPending}
                    aria-label={t("org-members-change-role")}
                    onChange={(event) =>
                      roleMutation.mutate({
                        userId: user.id,
                        role: event.currentTarget.value as OrganizationRole,
                      })
                    }
                  >
                    <option value="MEMBER">{t("org-role-member")}</option>
                    <option value="ADMINISTRATOR">{t("org-role-administrator")}</option>
                    <option value="OWNER">{t("org-role-owner")}</option>
                  </select>
                </Show>
                <Show when={canManageMembers() && user.id !== currentUserId()}>
                  <button
                    class="p-3"
                    disabled={deleteMutation.isPending && deleteMutation.variables === user.id}
                    onClick={() => deleteMutation.mutate(user.id)}
                  >
                    <span class="sr-only">{t("org-members-delete")}</span>
                    <Icon name="close" class="fill-on-surface size-6" />
                  </button>
                </Show>
              </li>
            )}
          </For>
        </ul>
        <Show when={canManageMembers()}>
          <Link
            to="/organizations/$id/members/add"
            params={{ id: organization().id }}
            class="floating-action-button"
          >
            <span class="sr-only">{t("org-members-add-member")}</span>
            <Icon name="add" class="fill-on-primary size-6" />
          </Link>
        </Show>
      </Page>
    </>
  );
}

import { useQueryClient } from "@tanstack/solid-query";
import { createFileRoute, useNavigate } from "@tanstack/solid-router";

import Body from "../Body";
import Icon from "../Icon";
import { useI18n } from "../i18n";
import { QUERY_BASE } from "../user";

export const Route = createFileRoute("/settings")({
  component: RouteComponent,
});

function RouteComponent() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { t } = useI18n();

  async function handleSignOut() {
    const response = await fetch("/api/sign-outs", { method: "POST" });
    if (!response.ok) {
      console.error("Sign out failed", response);
      return;
    }
    await queryClient.invalidateQueries({ queryKey: [QUERY_BASE] });
    await navigate({ to: "/sign-in", search: { redirect: window.location.href } });
  }

  return (
    <Body class="bg-surface-container-high text-on-surface grid h-dvh grid-rows-[auto_1fr]">
      <header class="bg-surface-container-high text-on-surface flex py-1">
        <button onClick={() => window.history.back()} class="cursor-default p-4">
          <span class="sr-only">{t("settings-back")}</span>
          <Icon name="arrow-back" class="fill-on-surface size-6" />
        </button>
        <h1 class="text-title-lg content-center">{t("settings-title")}</h1>
      </header>
      <main class="px-6 py-4">
        <ul class="flex flex-col gap-2">
          <li>
            <button
              data-testid="sign-out"
              onClick={handleSignOut}
              data-variant="outlined"
              class="button w-full"
            >
              <Icon name="logout" class="fill-on-surface-variant size-6" />
              {t("settings-sign-out")}
            </button>
          </li>
        </ul>
      </main>
    </Body>
  );
}

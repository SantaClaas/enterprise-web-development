import { useQueryClient } from "@tanstack/solid-query";
import { createFileRoute, Outlet } from "@tanstack/solid-router";

import Body from "../../Body";
import { useI18n } from "../../i18n";
import Navigation from "../../Navigation";
import { useTitle } from "../../Title";
import { ActionButton, TopAppBar } from "../../TopAppBar";
import { QUERY_BASE } from "../../user";

export const Route = createFileRoute("/_app")({
  component: RouteComponent,
});

function RouteComponent() {
  const queryClient = useQueryClient();
  const navigate = Route.useNavigate();
  const { t } = useI18n();

  async function handleSignOut() {
    const response = await fetch("/api/sign-outs", {
      method: "POST",
    });

    if (!response.ok) {
      console.error("Sign out failed", response);
      return;
    }

    await queryClient.invalidateQueries({ queryKey: [QUERY_BASE] });

    await navigate({ to: "/sign-in", search: { redirect: window.location.href } });
  }

  const title = useTitle();

  return (
    <Body class="relative grid h-dvh grid-cols-1 grid-rows-[auto_1fr_auto] lg:grid-cols-[auto_1fr] lg:grid-rows-[auto_1fr]">
      <Navigation />
      <TopAppBar
        title={title()}
        trailingAction={
          <ActionButton
            data-testid="sign-out"
            onClick={handleSignOut}
            icon={{ name: "logout", alternativeText: t("app-sign-out") }}
            position="trailing"
          />
        }
      />
      <Outlet />
    </Body>
  );
}

import { createFileRoute, Link, Outlet } from "@tanstack/solid-router";

import Body from "@/components/Body";
import Icon from "@/components/Icon";
import Navigation from "@/components/Navigation";
import { useTitle } from "@/components/Title";
import { TopAppBar } from "@/components/TopAppBar";

import { useI18n } from "../../i18n";

export const Route = createFileRoute("/_app")({
  component: RouteComponent,
});

function RouteComponent() {
  const { t } = useI18n();
  const title = useTitle();

  return (
    <Body class="relative grid h-dvh grid-cols-1 grid-rows-[auto_1fr_auto] lg:grid-cols-[auto_1fr] lg:grid-rows-[auto_1fr]">
      <Navigation />
      <TopAppBar
        title={title()}
        trailingAction={
          <Link
            data-testid="open-settings"
            to="/settings"
            data-position="trailing"
            class="action-button"
          >
            <Icon name="settings" class="fill-on-surface size-6" />
            <span class="sr-only">{t("app-settings")}</span>
          </Link>
        }
      />
      <Outlet />
    </Body>
  );
}

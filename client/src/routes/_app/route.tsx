import { createFileRoute, Link, Outlet } from "@tanstack/solid-router";

import Body from "../../Body";
import Icon from "../../Icon";
import { useI18n } from "../../i18n";
import Navigation from "../../Navigation";
import { useTitle } from "../../Title";
import { TopAppBar } from "../../TopAppBar";

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
          <Link data-testid="open-settings" to="/settings" data-position="trailing" class="action-button">
            <Icon name="settings" class="fill-on-surface size-6" />
            <span class="sr-only">{t("app-settings")}</span>
          </Link>
        }
      />
      <Outlet />
    </Body>
  );
}

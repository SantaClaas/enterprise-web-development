import { createFileRoute, Outlet } from "@tanstack/solid-router";

import Body from "../../Body";
import Navigation from "../../Navigation";

export const Route = createFileRoute("/_app")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <Body class="grid h-dvh grid-rows-[1fr_auto]">
      <Navigation />
      <Outlet />
    </Body>
  );
}

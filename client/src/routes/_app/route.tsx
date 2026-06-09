import { createFileRoute, Outlet } from "@tanstack/solid-router";

import Body from "../../Body";
import Navigation from "../../Navigation";
import { useTitle } from "../../Title";
import { ActionButton, TopAppBar } from "../../TopAppBar";
import { useUserContext } from "../../userContext";

export const Route = createFileRoute("/_app")({
  component: RouteComponent,
});

function RouteComponent() {
  const userContext = useUserContext();
  const navigate = Route.useNavigate();

  async function handleSignOut() {
    const response = await fetch("/api/sign-outs", {
      method: "POST",
    });

    if (!response.ok) {
      console.error("Sign out failed", response);
      return;
    }

    userContext.clear();

    await navigate({ to: "/sign-in", search: { redirect: window.location.href } });
  }

  const title = useTitle();

  return (
    <Body class="relative grid h-dvh grid-rows-[auto_1fr_auto]">
      <Navigation class="row-start-3" />
      <TopAppBar
        title={title()}
        trailingAction={
          <ActionButton
            onClick={handleSignOut}
            icon={{ name: "logout", alternativeText: "Sign out" }}
            position="trailing"
          />
        }
      />
      <Outlet />
    </Body>
  );
}

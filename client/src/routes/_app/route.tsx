import { createFileRoute, Outlet } from "@tanstack/solid-router";

import Body from "../../Body";
import Icon from "../../Icon";
import Navigation from "../../Navigation";
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

    userContext.setIsSignedIn(false);
    await navigate({ to: "/sign-in", search: { redirect: window.location.href } });
  }

  return (
    <Body class="grid h-dvh grid-rows-[auto_1fr_auto]">
      <Navigation class="row-start-3" />
      <header class="flex justify-end p-2">
        <button
          onClick={handleSignOut}
          class="bg-surface-container row-start-1 w-min rounded-full p-4"
        >
          <Icon name="logout" class="fill-on-surface size-6" />
          <span class="sr-only">Sign out</span>
        </button>
      </header>
      <Outlet />
    </Body>
  );
}

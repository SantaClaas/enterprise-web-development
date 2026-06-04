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
      <header class="grid grid-cols-[auto_1fr_auto] justify-end p-2">
        <h1 class="text-title-lg col-start-2">Times</h1>
        {/* Before element used to guarantee minimum touch target size on coarse pointer devices */}
        <button
          onClick={handleSignOut}
          class="bg-surface-container relative col-start-3 w-min rounded-full p-1 before:absolute before:top-1/2 before:left-1/2 before:size-[max(100%,44px)] before:-translate-1/2 pointer-fine:before:hidden"
        >
          <Icon name="logout" class="fill-on-surface size-6" />
          <span class="sr-only">Sign out</span>
        </button>
      </header>
      <Outlet />
    </Body>
  );
}

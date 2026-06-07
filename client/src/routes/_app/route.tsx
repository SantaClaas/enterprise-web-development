import { createFileRoute, Outlet } from "@tanstack/solid-router";

import Body from "../../Body";
import Icon from "../../Icon";
import Navigation from "../../Navigation";
import { useUserContext } from "../../userContext";

export const Route = createFileRoute("/_app")({
  component: RouteComponent,
});

function FloatingActionButton() {
  return (
    <a
      href="/times/new"
      class="rounded-medium bg-primary text-on-primary focus-within:outline-primary absolute right-4 bottom-20 size-14 content-center justify-items-center outline-offset-4 focus:outline-none"
    >
      <span class="sr-only">Log time</span>
      <Icon name="add" class="fill-on-primary size-6" />
    </a>
  );
}

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
      <header class="grid grid-cols-[3rem_1fr_3rem] gap-1 px-1 py-2">
        <h1 class="text-title-lg text-on-surface col-start-2 content-center text-center">Times</h1>
        {/* Before element used to guarantee minimum touch target size on coarse pointer devices */}
        <button
          onClick={handleSignOut}
          class="relative col-start-3 p-3 before:absolute before:top-1/2 before:left-1/2 before:size-[max(100%,44px)] before:-translate-1/2 pointer-fine:before:hidden"
        >
          <Icon name="logout" class="fill-on-surface size-6" />
          <span class="sr-only">Sign out</span>
        </button>
      </header>
      <FloatingActionButton />
      <Outlet />
    </Body>
  );
}

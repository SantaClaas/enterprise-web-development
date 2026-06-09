import "./index.css";
import { createRouter, RouterProvider } from "@tanstack/solid-router";
/* @refresh reload */
import { render } from "solid-js/web";

import { routeTree } from "./routeTree.gen";
import { TitleProvider } from "./Title";
import { UserContextProvider } from "./userContext";

// Keep polyfill out of the bundle. You can see this as vite generates two js bundles, one with only the polyfill and one without.
if (!("Temporal" in globalThis)) {
  console.debug("Temporal not found, polyfilling...");
  const { Temporal, toTemporalInstant } = await import("temporal-polyfill");
  // @ts-expect-error
  globalThis.Temporal = Temporal;
  // @ts-expect-error
  Date.prototype.toTemporalInstant = toTemporalInstant;
}

const router = createRouter({
  routeTree,
  defaultPreload: "intent",
  defaultStaleTime: 5000,
  scrollRestoration: true,
});

// Register things for typesafety
declare module "@tanstack/solid-router" {
  interface Register {
    router: typeof router;
  }
}

render(
  () => (
    <TitleProvider>
      <UserContextProvider>
        <RouterProvider router={router} />
      </UserContextProvider>
    </TitleProvider>
  ),
  document.body,
);

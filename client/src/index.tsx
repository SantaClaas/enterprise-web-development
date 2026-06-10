import "./index.css";
import { QueryClient, QueryClientProvider } from "@tanstack/solid-query";
import { createRouter, RouterProvider } from "@tanstack/solid-router";
/* @refresh reload */
import { render } from "solid-js/web";

import { routeTree } from "./routeTree.gen";
import { TitleProvider } from "./Title";
import { idQuery } from "./user";

// Keep polyfill out of the bundle. You can see this as vite generates two js bundles, one with only the polyfill and one without.
if (!("Temporal" in globalThis)) {
  console.debug("Temporal not found, polyfilling...");
  const { Temporal, toTemporalInstant } = await import("temporal-polyfill");
  // @ts-expect-error
  globalThis.Temporal = Temporal;
  // @ts-expect-error
  Date.prototype.toTemporalInstant = toTemporalInstant;
}
// Using Tanstack Query as async state management is essential for applications to me. For example this makes deleting an organization and showing that something is happening easier. It also allows for easy implementation for optimistic updates
const queryClient = new QueryClient();
// Start fetching the user id as that is our indicator if we are signed in and is needed everywhere in the application
void queryClient.prefetchQuery(idQuery);

// Using Tanstack Router for type safety on the routes and making view transition implementation easier
const router = createRouter({
  routeTree,
  defaultPreload: "intent",
  defaultStaleTime: 5_000,
  scrollRestoration: true,
  defaultViewTransition: true,
  context: { queryClient },
});

// Register things for typesafety
declare module "@tanstack/solid-router" {
  interface Register {
    router: typeof router;
  }
}

render(
  () => (
    <QueryClientProvider client={queryClient}>
      <TitleProvider>
        <RouterProvider router={router} />
      </TitleProvider>
    </QueryClientProvider>
  ),
  document.body,
);

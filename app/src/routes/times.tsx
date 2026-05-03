import { createFileRoute } from "@tanstack/solid-router";

import Body from "../Body";
import Navigation from "../Navigation";

export const Route = createFileRoute("/times")({
  component: Times,
});

function Times() {
  return (
    <Body class="grid h-dvh grid-rows-[1fr_auto]">
      <Navigation />
      <main class="bg-slate-50"></main>
    </Body>
  );
}

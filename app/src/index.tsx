import { Router, Route, Navigate } from "@solidjs/router";

import "./index.css";
/* @refresh reload */
import { render } from "solid-js/web";

import Organizations from "./Organizations";
import Projects from "./Projects";
import SignIn from "./SignIn";
import Times from "./Times";

// Keep polyfill out of the bundle. You can see this as vite generates two js bundles, one with only the polyfill and one without.
if (!("Temporal" in globalThis)) {
  console.debug("Temporal not found, polyfilling...");
  const { Temporal, toTemporalInstant } = await import("temporal-polyfill");
  // @ts-expect-error
  globalThis.Temporal = Temporal;
  // @ts-expect-error
  Date.prototype.toTemporalInstant = toTemporalInstant;
}

render(
  () => (
    <Router>
      <Route path="/" component={() => <Navigate href="/times" />} />
      <Route path="/sign-in" component={SignIn} />
      <Route path="/times" component={Times} />
      <Route path="/projects" component={Projects} />
      <Route path="/organizations" component={Organizations} />
    </Router>
  ),
  document.body,
);

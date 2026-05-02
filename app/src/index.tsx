import { Router, Route } from "@solidjs/router";

import "./index.css";
/* @refresh reload */
import { render } from "solid-js/web";

import App from "./App";
import SignIn from "./SignIn";

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
      <Route path="/" component={App} />
      <Route path="/sign-in" component={SignIn} />
    </Router>
  ),
  document.body,
);

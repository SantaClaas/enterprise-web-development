import type { QueryClient } from "@tanstack/solid-query";
import { createRootRouteWithContext, redirect } from "@tanstack/solid-router";

import { ErrorDetails } from "../ErrorDetails";
import { idQuery, UnauthenticatedError } from "../user";
import { Route as SignInRoute } from "./sign-in";
import { Route as SignUpRoute } from "./sign-up";

type Context = {
  queryClient: QueryClient;
};

const createRootRoute = createRootRouteWithContext<Context>();

export const Route = createRootRoute({
  async beforeLoad({ location, context: { queryClient } }) {
    if (location.pathname === SignInRoute.fullPath || location.pathname === SignUpRoute.fullPath) {
      console.debug("User is trying to access auth page, allowing without authentication");
      return;
    }

    // At the start of the application we prefetch the user id so that when this is run for the first time, it will resolve quickly. The result is also cached so that subsquent fetch calls will resolve immediately
    try {
      // We do not need the user id here for anything further. Successful resolution means the user is authenticated and can access the application, failure means they need to sign in. So we can ignore the result
      void (await queryClient.fetchQuery(idQuery));
    } catch (error) {
      // Not a fan of the nesting here but extracting this would create more complexity
      if (!(error instanceof UnauthenticatedError))
        throw new Error(`Error fetching user id`, { cause: error });

      console.debug("Error", error, "Redirecting to sign in page", {
        pathname: location.pathname,
        SignInRoute: SignInRoute.path,
        fullPath: SignInRoute.fullPath,
      });

      const search = { redirect: location.href === "/" ? undefined : location.href };
      // Throwing will stop any children from attempting to load and is the recommended way to redirect in a beforeLoad
      throw redirect({
        to: SignInRoute.fullPath,
        search,
      });
    }
  },
  errorComponent: (properties) => (
    <ErrorDetails
      {...properties}
      title="Error"
      explainer="Sorry, an unexpected error occurred. Please try again later."
    />
  ),
});

import { createContext, createResource, useContext, type ParentProps } from "solid-js";

async function getUserId() {
  const response = await fetch("/api/users/current/id");
  if (!response.ok)
    // throw new Error(`Error fetching current user ID: ${response.status} ${await response.text()}`);
    return undefined;

  const userId = await response.text();
  return userId as UserId;
}

type UserId = string & { __brand: "UserId" };

type Context = {
  getUserId: Promise<UserId | undefined>;
  refresh(): Promise<UserId | undefined>;
};

let getUserIdFetch = getUserId();
const initialContext = {
  get getUserId() {
    return getUserIdFetch;
  },
  refresh(): Promise<UserId | undefined> {
    return (getUserIdFetch = getUserId());
  },
};
const context = createContext<Context>(initialContext);

export function UserContextProvider(properties: ParentProps<{}>) {
  const [userId] = createResource(getUserId);
  return <context.Provider value={initialContext}>{properties.children}</context.Provider>;
}

export function useUserContext() {
  const current = useContext(context);

  return current;
}

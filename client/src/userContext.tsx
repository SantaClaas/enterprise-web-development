import { createContext, createResource, useContext, type ParentProps } from "solid-js";

import type { UserId } from "./branded";

async function getUserId() {
  const response = await fetch("/api/users/current/id");
  if (!response.ok)
    // throw new Error(`Error fetching current user ID: ${response.status} ${await response.text()}`);
    return undefined;

  const userId = await response.text();
  return userId as UserId;
}

type Context = {
  getUserId: Promise<UserId | undefined>;
  refresh(): Promise<UserId | undefined>;
  clear(): void;
  setUserId(userId: UserId): void;
};

let getUserIdFetch = getUserId();
const initialContext = {
  get getUserId() {
    return getUserIdFetch;
  },
  refresh(): Promise<UserId | undefined> {
    return (getUserIdFetch = getUserId());
  },
  clear() {
    getUserIdFetch = Promise.resolve(undefined);
  },
  setUserId(userId: UserId) {
    getUserIdFetch = Promise.resolve(userId);
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

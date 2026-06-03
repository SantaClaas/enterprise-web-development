import { createContext, createSignal, useContext, type Accessor, type ParentProps } from "solid-js";

async function getUser() {
  const response = await fetch("/api/user");

  return response.ok;
}

type Context = {
  getIsSignedIn: Promise<boolean>;
  setIsSignedIn(value: boolean): void;
};

let getIsSignedIn = getUser();
const initialContext = {
  getIsSignedIn,
  setIsSignedIn(value: boolean) {
    getIsSignedIn = Promise.resolve(value);
  },
};
const context = createContext<Context>(initialContext);

export function UserContextProvider(properties: ParentProps<{}>) {
  return <context.Provider value={initialContext}>{properties.children}</context.Provider>;
}

export function useUserContext() {
  const current = useContext(context);

  return current;
}

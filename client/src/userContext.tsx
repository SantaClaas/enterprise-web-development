import { createContext, useContext, type ParentProps } from "solid-js";

const context = createContext({
  isSignedIn: false,
});

export function UserContextProvider(properties: ParentProps<{}>) {
  return <context.Provider value={{ isSignedIn: false }}>{properties.children}</context.Provider>;
}

export function useUserContext() {
  return useContext(context);
}

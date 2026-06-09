import {
  createContext,
  createEffect,
  createSignal,
  useContext,
  type Accessor,
  type ParentProps,
  type Signal,
  type VoidProps,
} from "solid-js";

const context = createContext<Signal<string> | undefined>(undefined);

export function TitleProvider(properties: ParentProps<{}>) {
  const signal = createSignal(document.title);

  createEffect(() => {
    const [title] = signal;
    document.title = title();
  });

  return <context.Provider value={signal}>{properties.children}</context.Provider>;
}

export function useTitle(): Accessor<string> {
  const titleSignal = useContext(context);
  if (!titleSignal) throw new Error("useTitle must be used within a TitleProvider");

  const [title] = titleSignal;
  return title;
}

//TODO figure out a better API or name as the property has the same name as the component
export function Title(properties: VoidProps<{ title: string }>) {
  console.debug("Setting title to", properties.title);
  const titleSignal = useContext(context);
  if (!titleSignal) throw new Error("Title must be used within a TitleProvider");

  const [, setTitle] = titleSignal;
  createEffect(() => {
    setTitle(properties.title);
  });

  return undefined;
}

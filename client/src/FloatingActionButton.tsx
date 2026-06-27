import {
  createContext,
  createEffect,
  createSignal,
  onCleanup,
  useContext,
  type Accessor,
  type ParentProps,
  type Signal,
  type VoidProps,
} from "solid-js";

import type { IconId } from "./Icon";

type FloatingActionButtonConfig = {
  to: string;
  label: string;
  icon: IconId;
} | null;

const context = createContext<Signal<FloatingActionButtonConfig> | undefined>(undefined);

export function FloatingActionButtonProvider(properties: ParentProps) {
  const signal = createSignal<FloatingActionButtonConfig>(null);
  return <context.Provider value={signal}>{properties.children}</context.Provider>;
}

export function useFloatingActionButton(): Accessor<FloatingActionButtonConfig> {
  const signal = useContext(context);
  if (!signal)
    throw new Error("useFloatingActionButton must be used within a FloatingActionButtonProvider");

  const [floatingActionButton] = signal;
  return floatingActionButton;
}

export function FloatingActionButton(
  properties: VoidProps<{ to: string; label: string; icon: IconId }>,
) {
  const signal = useContext(context);
  if (!signal)
    throw new Error("FloatingActionButton must be used within a FloatingActionButtonProvider");

  const [, setFloatingActionButton] = signal;

  createEffect(() => {
    setFloatingActionButton({
      to: properties.to,
      label: properties.label,
      icon: properties.icon as IconId,
    });
  });

  onCleanup(() => setFloatingActionButton(null));

  return undefined;
}

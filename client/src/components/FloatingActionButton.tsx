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

type FloatingActionButtonConfiguration = {
  label: string;
  icon: IconId;
} & (
  | {
      to: string;
      onClick?: never;
    }
  | {
      to?: never;
      onClick: () => void;
    }
);

const context = createContext<Signal<FloatingActionButtonConfiguration | undefined>>();

export function FloatingActionButtonProvider(properties: ParentProps) {
  const signal = createSignal<FloatingActionButtonConfiguration | undefined>();
  return <context.Provider value={signal}>{properties.children}</context.Provider>;
}

export function useFloatingActionButton(): Accessor<FloatingActionButtonConfiguration | undefined> {
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

  onCleanup(() => setFloatingActionButton(undefined));

  return undefined;
}

export function FloatingActionButtonAction(
  properties: VoidProps<{ onClick: () => void; label: string; icon: IconId }>,
) {
  const signal = useContext(context);
  if (!signal)
    throw new Error(
      "FloatingActionButtonAction must be used within a FloatingActionButtonProvider",
    );

  const [, setFloatingActionButton] = signal;

  createEffect(() => {
    setFloatingActionButton({
      onClick: properties.onClick,
      label: properties.label,
      icon: properties.icon as IconId,
    });
  });

  onCleanup(() => setFloatingActionButton(undefined));

  return undefined;
}

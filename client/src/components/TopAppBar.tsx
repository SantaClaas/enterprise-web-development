import type { JSX, VoidProps } from "solid-js";

import Icon, { type IconId } from "./Icon";

export type ActionButtonProperties = JSX.ButtonHTMLAttributes<HTMLButtonElement> & {
  //TODO the position is redundant in component properties and this property
  position: "leading" | "trailing";
  icon: {
    name: IconId;
    alternativeText: string;
  };
};

/**
 * @deprecated use the CSS component class "action-button" instead as it does not require JS to overwrite CSS
 * classes and uses CSS layering instead
 */
export function ActionButton(properties: VoidProps<ActionButtonProperties>) {
  const { icon, ...buttonProperties } = properties;

  /* Before element used to guarantee minimum touch target size on coarse pointer devices */
  return (
    <button
      data-position={properties.position}
      class="relative p-3 before:absolute before:top-1/2 before:left-1/2 before:size-[max(100%,44px)] before:-translate-1/2 data-[position=leading]:col-start-1 data-[position=trailing]:col-start-3 pointer-fine:before:hidden"
      {...buttonProperties}
    >
      <Icon name={icon.name} class="fill-on-surface size-6" />
      <span class="sr-only">{icon.alternativeText}</span>
    </button>
  );
}

export type TopAppBarProperties = {
  title: string;
  leadingAction?: JSX.Element;
  trailingAction?: JSX.Element;
};

export function TopAppBar(properties: VoidProps<TopAppBarProperties>) {
  return (
    <header class="grid grid-cols-[3rem_1fr_3rem] gap-1 px-1 py-2 lg:col-start-2">
      {properties.leadingAction}
      <h1 class="text-title-lg text-on-surface col-start-2 content-center text-center">
        {properties.title}
      </h1>
      {properties.trailingAction}
    </header>
  );
}

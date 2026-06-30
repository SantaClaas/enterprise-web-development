import type { ParentProps } from "solid-js";
import type { JSX } from "solid-js";

export function TextFieldLabel(properties: ParentProps<JSX.LabelHTMLAttributes<HTMLLabelElement>>) {
  return <label {...properties} class="group relative block"></label>;
}

export function TextFieldLabelText(properties: ParentProps<JSX.HTMLAttributes<HTMLSpanElement>>) {
  return (
    <span
      {...properties}
      class="group-focus-within:text-body-sm group-focus-within:bg-surface text-on-surface-variant group-focus-within:text-primary absolute top-1/2 left-4 -translate-y-1/2 transition-all group-focus-within:-top-0.5 group-focus-within:left-3 group-focus-within:px-1"
    />
  );
}

export function TextFieldInput(properties: ParentProps<JSX.InputHTMLAttributes<HTMLInputElement>>) {
  return (
    <input
      {...properties}
      class="border-outline rounded-extra-small focus-visible:outline-primary text-body-lg col-start-1 row-start-1 w-full border px-4 py-4 leading-6 focus-visible:outline-3"
    />
  );
}

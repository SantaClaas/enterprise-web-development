import type { ParentProps } from "solid-js";

/** Convenience component to get tooling support like Tailwind CSS autocomplete for class attribute */
export default function Body(properties: ParentProps<{ class: string }>) {
  // SolidJS runs this function only once when rendering the component
  document.body.className = properties.class;
  return properties.children;
}

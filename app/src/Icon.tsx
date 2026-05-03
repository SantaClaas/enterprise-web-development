import type { VoidProps } from "solid-js";

export const ICON_NAME = {
  CALENDAR_MONTH: "calendar-month",
  CALENDAR_MONTH_FILLED: "calendar-month-filled",
} as const;

type IconName = (typeof ICON_NAME)[keyof typeof ICON_NAME];
type Properties = VoidProps<{ name: IconName; class?: string }>;
export default function Icon(properties: Properties) {
  return (
    <svg class={properties.class}>
      <use href={`/icons.svg#${properties.name}`} />
    </svg>
  );
}

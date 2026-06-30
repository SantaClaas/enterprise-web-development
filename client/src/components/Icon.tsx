import type { VoidProps } from "solid-js";

export const ICON_ID = {
  CALENDAR_MONTH: "calendar-month",
  CALENDAR_MONTH_FILLED: "calendar-month-filled",
  GROUP: "group",
  GROUP_FILLED: "group-filled",
  ASSIGNMENT: "assignment",
  ASSIGNMENT_FILLED: "assignment-filled",
  PASSKEY: "passkey",
  LOGOUT: "logout",
  ADD: "add",
  EDIT: "edit",
  CLOSE: "close",
  ARROW_BACK: "arrow-back",
  OPEN_IN_NEW_WINDOW: "open-in-new-window",
  SAVE: "save",
  DELETE: "delete",
  PLAY_ARROW: "play-arrow",
  PAUSE: "pause",
  STOP: "stop",
  TIMER: "timer",
  TIMER_FILLED: "timer-filled",
  SETTINGS: "settings",
} as const;

export type IconId = (typeof ICON_ID)[keyof typeof ICON_ID];
type Properties = VoidProps<{ name: IconId; class?: string }>;
export default function Icon(properties: Properties) {
  return (
    <svg class={properties.class}>
      <use href={`/icons.svg#${properties.name}`} />
    </svg>
  );
}

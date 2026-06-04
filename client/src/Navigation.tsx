import { Link } from "@tanstack/solid-router";
import type { JSX, VoidProps } from "solid-js";

import Icon from "./Icon";

export default function Navigation(properties: VoidProps<JSX.HTMLAttributes<HTMLElement>>) {
  return (
    <nav {...properties}>
      <menu class="bg-surface-container text-on-surface-variant grid grid-cols-3 text-xs leading-4 font-medium">
        <li>
          <Link to="/times" class="group block cursor-default py-1.5 text-center">
            <div class="group-[.active]:bg-secondary-container group-[.active]:fill-on-secondary-container fill-on-surface-variant group-[.active]:text-secondary hover:bg-on-secondary-container/8 mx-auto max-w-min rounded-2xl px-4 py-1">
              <Icon name="calendar-month" class="block size-6 group-[.active]:hidden" />
              <Icon name="calendar-month-filled" class="hidden size-6 group-[.active]:block" />
            </div>
            <span class="mt-1 block">Times</span>
          </Link>
        </li>
        <li>
          <Link to="/projects" class="group block cursor-default py-1.5 text-center">
            {/* Any way to avoid drawing a box around the icon? */}
            <div class="group-[.active]:bg-secondary-container group-[.active]:fill-on-secondary-container fill-on-surface-variant group-[.active]:text-secondary hover:bg-on-secondary-container/8 mx-auto max-w-min rounded-2xl px-4 py-1">
              <Icon
                name="assignment"
                class="fill-on-secondary-container block size-6 group-[.active]:hidden"
              />
              <Icon
                name="assignment-filled"
                class="fill-on-secondary-container hidden size-6 group-[.active]:block"
              />
            </div>
            <span class="mt-1 block">Projects</span>
          </Link>
        </li>
        <li>
          <Link to="/organizations" class="group block cursor-default py-1.5 text-center">
            <div class="group-[.active]:bg-secondary-container group-[.active]:fill-on-secondary-container fill-on-surface-variant group-[.active]:text-secondary hover:bg-on-secondary-container/8 mx-auto max-w-min rounded-2xl px-4 py-1">
              <Icon
                name="group"
                class="fill-on-secondary-container block size-6 group-[.active]:hidden"
              />
              <Icon
                name="group-filled"
                class="hidden size-6 fill-slate-950 group-[.active]:block"
              />
            </div>
            <span class="mt-1 block">Organization</span>
          </Link>
        </li>
      </menu>
    </nav>
  );
}

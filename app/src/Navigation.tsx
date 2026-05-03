import { Link } from "@tanstack/solid-router";

import Icon from "./Icon";

export default function Navigation() {
  return (
    <nav class="row-start-2">
      <menu class="grid grid-cols-3 text-xs leading-4 font-medium">
        <li>
          <Link to="/times" class="group block py-1.5 text-center">
            <div class="mx-auto max-w-min rounded-2xl px-4 py-1 group-[.active]:bg-slate-400 hover:bg-slate-300">
              <Icon
                name="calendar-month"
                class="block size-6 fill-slate-950 group-[.active]:hidden"
              />
              <Icon
                name="calendar-month-filled"
                class="hidden size-6 fill-slate-950 group-[.active]:block"
              />
            </div>
            <span class="mt-1 block">Times</span>
          </Link>
        </li>
        <li>
          <Link to="/projects" class="group block py-1.5 text-center">
            {/* Any way to avoid drawing a box around the icon? */}
            <div class="mx-auto max-w-min rounded-2xl px-4 py-1 group-[.active]:bg-slate-400 hover:bg-slate-300">
              <Icon name="assignment" class="block size-6 fill-slate-950 group-[.active]:hidden" />
              <Icon
                name="assignment-filled"
                class="hidden size-6 fill-slate-950 group-[.active]:block"
              />
            </div>
            <span class="mt-1 block">Projects</span>
          </Link>
        </li>
        <li>
          <Link to="/organizations" class="group block py-1.5 text-center">
            <div class="mx-auto max-w-min rounded-2xl px-4 py-1 group-[.active]:bg-slate-400 hover:bg-slate-300">
              <Icon name="group" class="block size-6 fill-slate-950 group-[.active]:hidden" />
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

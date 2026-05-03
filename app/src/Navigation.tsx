import { A } from "@solidjs/router";

import Icon from "./Icon";

export default function Navigation() {
  return (
    <nav class="row-start-2">
      <menu class="grid grid-cols-3 text-xs leading-4 font-medium">
        <li>
          <A class="group block py-1.5 text-center" href="/times">
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
          </A>
        </li>
        <li>
          <A class="group block py-1.5 text-center" href="/projects">
            {/* Any way to avoid drawing a box around the icon? */}
            <div class="mx-auto max-w-min rounded-2xl px-4 py-1 group-[.active]:bg-slate-400 hover:bg-slate-300">
              <Icon name="assignment" class="block size-6 fill-slate-950 group-[.active]:hidden" />
              <Icon
                name="assignment-filled"
                class="hidden size-6 fill-slate-950 group-[.active]:block"
              />
            </div>
            <span class="mt-1 block">Projects</span>
          </A>
        </li>
        <li>
          <A class="group block py-1.5 text-center" href="/organizations">
            <div class="mx-auto max-w-min rounded-2xl px-4 py-1 group-[.active]:bg-slate-400 hover:bg-slate-300">
              <Icon name="group" class="block size-6 fill-slate-950 group-[.active]:hidden" />
              <Icon
                name="group-filled"
                class="hidden size-6 fill-slate-950 group-[.active]:block"
              />
            </div>
            <span class="mt-1 block">Organization</span>
          </A>
        </li>
      </menu>
    </nav>
  );
}

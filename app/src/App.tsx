import { A } from "@solidjs/router";
import { createSignal, For } from "solid-js";

import Body from "./Body";
import Icon from "./Icon";

function Fun() {
  return (
    <>
      <span class="ms-4 rounded-full border-4 border-red-500 bg-red-300 px-4 py-2 font-serif font-black text-red-900">
        Monday
      </span>
      <span class="ms-4 rounded-full border-4 border-orange-500 bg-orange-300 px-4 py-2 font-serif font-black text-orange-900">
        Tuesday
      </span>
      <span class="ms-4 rounded-full border-4 border-yellow-500 bg-yellow-300 px-4 py-2 font-serif font-black text-yellow-900">
        Wednesday
      </span>
      <span class="ms-4 rounded-full border-4 border-green-500 bg-green-300 px-4 py-2 font-serif font-black text-green-900">
        Thursday
      </span>
      <span class="ms-4 rounded-full border-4 border-blue-500 bg-blue-300 px-4 py-2 font-serif font-black text-blue-900">
        Friday
      </span>
      <span class="ms-4 rounded-full border-4 border-indigo-500 bg-indigo-300 px-4 py-2 font-serif font-black text-indigo-900">
        Saturday
      </span>
      <span class="ms-4 rounded-full border-4 border-violet-500 bg-violet-300 px-4 py-2 font-serif font-black text-violet-900">
        Sunday
      </span>
    </>
  );
}

type Entry = [from: string, to: string];
type Data = {
  date: string;
  entries: Entry[];
};
function App() {
  const [data] = createSignal<Data[]>([
    {
      date: "2026-04-27",
      entries: [
        ["14:00", "14:40"],
        ["16:30", "20:30"],
      ],
    },
    {
      date: "2026-04-28",
      entries: [
        ["10:20", "11:30"],
        ["14:30", "18:00"],
        ["18:15", "19:45"],
      ],
    },
    {
      date: "2026-04-29",
      entries: [
        ["13:00", "13:30"],
        ["14:30", "19:40"],
      ],
    },
    {
      date: "2026-04-30",
      entries: [["09:15", "13:00"]],
    },
    {
      date: "2026-05-01",
      entries: [
        ["10:45", "11:15"],
        ["17:00", "18:00"],
      ],
    },
    { date: "2026-05-02", entries: [["10:15", "18:30"]] },
    { date: "2026-05-03", entries: [] },
  ]);

  return (
    <Body class="grid h-dvh grid-rows-[1fr_auto]">
      <nav class="row-start-2">
        <menu class="grid grid-cols-3 text-xs leading-4 font-medium">
          <li>
            <A class="group block py-1.5 text-center" href="/">
              <div class="mx-auto max-w-min rounded-2xl px-4 py-1 group-[.active]:bg-slate-400 hover:bg-slate-300">
                <Icon class="block size-6 group-[.active]:hidden" name="calendar-month" />
                <Icon class="hidden size-6 group-[.active]:block" name="calendar-month-filled" />
              </div>
              <span class="mt-1 block">Times</span>
            </A>
          </li>
          <li>
            <A class="group block py-1.5 text-center" href="/projects">
              {/* Any way to avoid drawing a box around the icon? */}
              <div class="mx-auto max-w-min rounded-2xl px-4 py-1 group-[.active]:bg-slate-400 hover:bg-slate-300">
                <Icon class="block size-6 group-[.active]:hidden" name="calendar-month" />
                <Icon class="hidden size-6 group-[.active]:block" name="calendar-month-filled" />
              </div>
              <span class="mt-1 block">Projects</span>
            </A>
          </li>
          <li>
            <A class="group block py-1.5 text-center" href="/orgranization">
              <div class="mx-auto max-w-min rounded-2xl px-4 py-1 group-[.active]:bg-slate-400 hover:bg-slate-300">
                <Icon class="block size-6 group-[.active]:hidden" name="calendar-month" />
                <Icon class="hidden size-6 group-[.active]:block" name="calendar-month-filled" />
              </div>
              <span class="mt-1 block">Organization</span>
            </A>
          </li>
        </menu>
      </nav>
      <main class="bg-slate-50"></main>
    </Body>
  );
}

export default App;

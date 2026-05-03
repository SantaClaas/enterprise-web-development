import { createSignal } from "solid-js";

import Body from "./Body";
import Navigation from "./Navigation";

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
export default function Times() {
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
      <Navigation />
      <main class="bg-slate-50"></main>
    </Body>
  );
}

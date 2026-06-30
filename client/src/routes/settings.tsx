import { useQueryClient } from "@tanstack/solid-query";
import { createFileRoute, useNavigate } from "@tanstack/solid-router";
import { createSignal, For } from "solid-js";

import Body from "@/components/Body";
import Icon from "@/components/Icon";

import { type SupportedLocale, useI18n } from "../i18n";
import { QUERY_BASE } from "../user";

export const Route = createFileRoute("/settings")({
  component: RouteComponent,
});

type Theme = "system" | "light" | "dark";

const THEME_STORAGE_KEY = "color-scheme";

const THEMES: { value: Theme; labelKey: string }[] = [
  { value: "system", labelKey: "settings-theme-system" },
  { value: "light", labelKey: "settings-theme-light" },
  { value: "dark", labelKey: "settings-theme-dark" },
];

const LOCALES: { value: SupportedLocale; label: string }[] = [
  { value: "en-US", label: "English" },
  { value: "de-DE", label: "Deutsch" },
];

function applyTheme(t: Theme) {
  localStorage.setItem(THEME_STORAGE_KEY, t);
  if (t === "system") {
    delete document.documentElement.dataset.colorScheme;
  } else {
    document.documentElement.dataset.colorScheme = t;
  }
}

function RouteComponent() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { t, locale, setLocale } = useI18n();

  const [theme, setTheme] = createSignal<Theme>(
    (localStorage.getItem(THEME_STORAGE_KEY) as Theme | null) ?? "system",
  );

  function handleThemeChange(value: Theme) {
    setTheme(value);
    applyTheme(value);
  }

  async function handleSignOut() {
    const response = await fetch("/api/sign-outs", { method: "POST" });
    if (!response.ok) {
      console.error("Sign out failed", response);
      return;
    }
    await queryClient.invalidateQueries({ queryKey: [QUERY_BASE] });
    await navigate({ to: "/sign-in", search: { redirect: window.location.href } });
  }

  return (
    <Body class="bg-surface-container-high text-on-surface grid h-dvh grid-rows-[auto_1fr]">
      <header class="bg-surface-container-high text-on-surface flex py-1">
        <button onClick={() => window.history.back()} class="cursor-default p-4">
          <span class="sr-only">{t("settings-back")}</span>
          <Icon name="arrow-back" class="fill-on-surface size-6" />
        </button>
        <h1 class="text-title-lg content-center">{t("settings-title")}</h1>
      </header>
      <main class="overflow-y-auto px-6 py-4">
        <ul class="flex flex-col gap-8">
          <li>
            <h2 class="text-label-lg text-on-surface-variant mb-3">{t("settings-appearance")}</h2>
            <div class="border-outline-variant flex gap-1 rounded-full border p-1">
              <For each={THEMES}>
                {(option) => (
                  <button
                    onClick={() => handleThemeChange(option.value)}
                    data-active={theme() === option.value ? "" : undefined}
                    class="text-label-lg text-on-surface-variant data-[active]:bg-secondary-container data-[active]:text-on-secondary-container flex-1 cursor-default rounded-full px-4 py-2"
                  >
                    {t(option.labelKey)}
                  </button>
                )}
              </For>
            </div>
          </li>

          <li>
            <label for="language-select" class="text-label-lg text-on-surface-variant mb-3 block">
              {t("settings-language")}
            </label>
            <select
              id="language-select"
              class="text-field w-full"
              value={locale()}
              onChange={(event) => setLocale(event.currentTarget.value as SupportedLocale)}
            >
              <For each={LOCALES}>{(lang) => <option value={lang.value}>{lang.label}</option>}</For>
            </select>
          </li>

          <li>
            <h2 class="text-label-lg text-on-surface-variant mb-3">{t("settings-account")}</h2>
            <button
              data-testid="sign-out"
              onClick={handleSignOut}
              data-variant="outlined"
              class="button w-full"
            >
              <Icon name="logout" class="fill-on-surface-variant size-6" />
              {t("settings-sign-out")}
            </button>
          </li>
        </ul>
      </main>
    </Body>
  );
}

import { Link } from "@tanstack/solid-router";
import { Show } from "solid-js";
import type { JSX, VoidProps } from "solid-js";

import { useI18n } from "@/i18n";

import { useFloatingActionButton } from "./FloatingActionButton";
import Icon from "./Icon";

export default function Navigation(_properties: VoidProps<JSX.HTMLAttributes<HTMLDivElement>>) {
  const floatingActionButton = useFloatingActionButton();
  const { t } = useI18n();

  return (
    <div class="bg-surface-container text-on-surface-variant row-start-3 lg:row-span-full lg:flex lg:min-w-24 lg:flex-col lg:items-center">
      <Show when={floatingActionButton()}>
        {(configuration) => (
          <Show
            when={configuration().to}
            fallback={
              <button
                data-testid="floating-action-button"
                onClick={configuration().onClick}
                class="floating-action-button lg:bg-on-primary-container absolute right-6 bottom-22 lg:static lg:mt-10"
              >
                <span class="sr-only">{configuration().label}</span>
                <Icon name={configuration().icon} class="fill-on-primary size-6" />
              </button>
            }
          >
            {(to) => (
              <Link
                data-testid="floating-action-button"
                to={to()}
                class="floating-action-button lg:bg-on-primary-container absolute right-6 bottom-22 lg:static lg:mt-10"
              >
                <span class="sr-only">{configuration().label}</span>
                <Icon name={configuration().icon} class="fill-on-primary size-6" />
              </Link>
            )}
          </Show>
        )}
      </Show>
      <nav class="lg:mt-10">
        <menu class="grid grid-cols-4 text-xs leading-4 font-medium lg:flex lg:h-full lg:flex-col">
          <li>
            <Link
              data-testid="navigation-times"
              to="/times"
              class="group block cursor-default py-1.5 text-center"
            >
              <div class="group-[.active]:bg-secondary-container group-[.active]:fill-on-secondary-container fill-on-surface-variant group-[.active]:text-secondary hover:bg-on-secondary-container/8 mx-auto max-w-min rounded-2xl px-4 py-1">
                <Icon name="calendar-month" class="block size-6 group-[.active]:hidden" />
                <Icon name="calendar-month-filled" class="hidden size-6 group-[.active]:block" />
              </div>
              <span class="mt-1 block">{t("nav-times")}</span>
            </Link>
          </li>
          <li>
            <Link
              data-testid="navigation-timer"
              to="/timer"
              class="group block cursor-default py-1.5 text-center"
            >
              <div class="group-[.active]:bg-secondary-container group-[.active]:fill-on-secondary-container fill-on-surface-variant group-[.active]:text-secondary hover:bg-on-secondary-container/8 mx-auto max-w-min rounded-2xl px-4 py-1">
                <Icon name="timer" class="block size-6 group-[.active]:hidden" />
                <Icon name="timer-filled" class="hidden size-6 group-[.active]:block" />
              </div>
              <span class="mt-1 block">{t("nav-timer")}</span>
            </Link>
          </li>
          <li>
            <Link
              data-testid="navigation-projects"
              to="/projects"
              class="group block cursor-default py-1.5 text-center"
            >
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
              <span class="mt-1 block">{t("nav-projects")}</span>
            </Link>
          </li>
          <li>
            <Link
              data-testid="navigation-organizations"
              to="/organizations"
              class="group block cursor-default py-1.5 text-center"
            >
              <div class="group-[.active]:bg-secondary-container group-[.active]:fill-on-secondary-container fill-on-surface-variant group-[.active]:text-secondary hover:bg-on-secondary-container/8 mx-auto max-w-min rounded-2xl px-4 py-1">
                <Icon
                  name="group"
                  class="fill-on-secondary-container block size-6 group-[.active]:hidden"
                />
                <Icon
                  name="group-filled"
                  class="fill-on-secondary-container hidden size-6 group-[.active]:block"
                />
              </div>
              <span class="mt-1 block">{t("nav-organizations")}</span>
            </Link>
          </li>
        </menu>
      </nav>
    </div>
  );
}

import { FluentBundle, FluentResource, type FluentVariable } from "@fluent/bundle";
import { negotiateLanguages } from "@fluent/langneg";
import { createContext, createMemo, createSignal, useContext, type ParentProps } from "solid-js";

// Included in bundle even if translation is not not used. This is fine for now but needs to be changed in the future.
import deFtl from "./locales/de-DE.ftl?raw";
import enFtl from "./locales/en-US.ftl?raw";

const MESSAGES: Record<string, string> = {
  "en-US": enFtl,
  "de-DE": deFtl,
};

const SUPPORTED_LOCALES = ["en-US", "de-DE"] as const;
const DEFAULT_LOCALE = "en-US";

function createBundle(locale: string): FluentBundle {
  const bundle = new FluentBundle(locale);
  const resource = new FluentResource(MESSAGES[locale] ?? MESSAGES[DEFAULT_LOCALE]);
  bundle.addResource(resource);
  return bundle;
}

export type TranslateArguments = Record<string, FluentVariable>;

const I18nContext = createContext<{
  /**
   * Translate a message by its id, optionally providing arguments for placeholders. This function
   * uses an acronym/abbreviation for "translate" and one of the few exceptions for convenience in
   * this repository.
   */
  t: (id: string, args?: TranslateArguments) => string;
  locale: () => string;
  setLocale: (locale: string) => void;
}>();

export function I18nProvider(properties: ParentProps) {
  const userLocales = Array.from(
    navigator.languages?.length ? navigator.languages : [navigator.language ?? DEFAULT_LOCALE],
  );
  const negotiated = negotiateLanguages(userLocales, SUPPORTED_LOCALES, {
    defaultLocale: DEFAULT_LOCALE,
  });
  const [locale, setLocale] = createSignal(negotiated[0] ?? DEFAULT_LOCALE);

  const bundle = createMemo(() => createBundle(locale()));

  function t(id: string, translationArguments?: TranslateArguments): string {
    const currentBundle = bundle();
    const message = currentBundle.getMessage(id);
    if (!message?.value) return id;
    const errors: Error[] = [];
    return currentBundle.formatPattern(message.value, translationArguments, errors);
  }

  return (
    <I18nContext.Provider value={{ t, locale, setLocale }}>
      {properties.children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) throw new Error("useI18n must be used within I18nProvider");
  return context;
}

import {
  createContext,
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { rsConfig, StoreKey } from "@/tauri/store";
import { Locale } from "@/i18n";
import { Theme } from "@/components/layout/theme-provider";

interface GlobalStoreCtx {
  load: boolean;
  locale: Locale;
  setLocale: Dispatch<SetStateAction<GlobalStoreCtx["locale"]>>;
  theme: Theme;
  setTheme: Dispatch<SetStateAction<GlobalStoreCtx["theme"]>>;
}

const ctx = createContext<GlobalStoreCtx>({
  load: false,
  locale: Locale.DEFAULT,
  setLocale: () => null,
  theme: Theme.DEFAULT,
  setTheme: () => null,
});

const localeConfig = rsConfig<Locale>(StoreKey.LOCALE);
const themeConfig = rsConfig<Theme>(StoreKey.THEME);

export function GlobalStore({ children }: PropsWithChildren) {
  const [load, setLoad] = useState(false);
  const [locale, setLocale] = useState<GlobalStoreCtx["locale"]>(
    Locale.DEFAULT,
  );
  const [theme, setTheme] = useState<GlobalStoreCtx["theme"]>(Theme.DEFAULT);

  useEffect(() => {
    async function init() {
      const locale = await localeConfig.get(Locale.DEFAULT);
      const theme = await themeConfig.get(Theme.DEFAULT);
      setLocale(locale);
      setTheme(theme);
      setLoad(true);
    }

    init().finally();
  }, []);
  useEffect(() => {
    if (load && locale) localeConfig.set(locale).finally();
  }, [load, locale]);
  useEffect(() => {
    if (load && theme) themeConfig.set(theme).finally();
  }, [load, theme]);
  const value = useMemo(
    () => ({
      load,
      theme: theme || Theme.DEFAULT,
      locale: locale || Locale.DEFAULT,
      setLocale,
      setTheme,
    }),
    [load, locale, theme],
  );
  return <ctx.Provider value={value}>{children}</ctx.Provider>;
}

export const useGlobalStore = () => useContext(ctx)!;

export const useStoreValue = <T extends string = string>(
  key: StoreKey,
  defaultValue: T,
) => {
  const [load, setLoad] = useState(false);
  const [pending, setPending] = useState(false);
  const [value, setValue] = useState<string | null>(null);
  const config = rsConfig<T>(key);
  const reload = useCallback(
    () =>
      config
        .get(defaultValue)
        .then((v) => setValue(v))
        .finally(() => setLoad(true)),
    [config, defaultValue],
  );
  useEffect(() => {
    config
      .get(defaultValue)
      .then((v) => setValue(v))
      .finally(() => setLoad(true));
  }, [config, defaultValue]);
  const update = useCallback(
    async (value: string) => {
      if (pending) return;
      setPending(true);
      await config.set(value);
      setValue(value);
      setPending(false);
    },
    [config, pending],
  );
  return { load, value, setValue: update, pending, reload };
};

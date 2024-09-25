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
import { getRsConfig, setRsConfig, StoreKey } from "@/tauri/store";
import { Locale } from "@/i18n";
import { DEFAULT_THEME, Theme } from "@/components/layout/theme-provider";

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

export function GlobalStore({ children }: PropsWithChildren) {
  const [load, setLoad] = useState(false);
  const [locale, setLocale] = useState<GlobalStoreCtx["locale"]>(
    Locale.DEFAULT,
  );
  const [theme, setTheme] = useState<GlobalStoreCtx["theme"]>(Theme.DEFAULT);

  useEffect(() => {
    async function init() {
      const locale = await getRsConfig<Locale>(StoreKey.LOCALE, Locale.DEFAULT);
      const theme = await getRsConfig<Theme>(StoreKey.THEME, DEFAULT_THEME);
      setLocale(locale);
      setTheme(theme);
      setLoad(true);
    }

    init().finally();
  }, []);
  useEffect(() => {
    if (load && locale) setRsConfig(StoreKey.LOCALE, locale).finally();
  }, [load, locale]);
  useEffect(() => {
    if (load && theme) setRsConfig(StoreKey.THEME, theme).finally();
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

export const useStoreValue = (key: StoreKey) => {
  const [load, setLoad] = useState(false);
  const [pending, setPending] = useState(false);
  const [value, setValue] = useState<string | null>(null);
  const reload = useCallback(
    () =>
      getRsConfig(key, "")
        .then((v) => setValue(v))
        .finally(() => setLoad(true)),
    [key],
  );
  useEffect(() => {
    getRsConfig(key, "")
      .then((v) => setValue(v))
      .finally(() => setLoad(true));
  }, [key]);
  const update = useCallback(
    async (value: string) => {
      if (pending) return;
      setPending(true);
      await setRsConfig(key, value);
      setValue(value);
      setPending(false);
    },
    [key, pending],
  );
  return { load, value, setValue: update, pending, reload };
};

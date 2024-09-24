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
import { getRsConfig, setRsConfig, StorePath } from "@/tauri/store";

interface GlobalStoreCtx {
  load: boolean;
  locale: string;
  setLocale: Dispatch<SetStateAction<GlobalStoreCtx["locale"]>>;
  theme: string;
  setTheme: Dispatch<SetStateAction<GlobalStoreCtx["theme"]>>;
}

const ctx = createContext<GlobalStoreCtx>({
  load: false,
  locale: "zh",
  setLocale: () => null,
  theme: "light",
  setTheme: () => null,
});

export function GlobalStore({ children }: PropsWithChildren) {
  const [load, setLoad] = useState(false);
  const [locale, setLocale] = useState<GlobalStoreCtx["locale"]>("zh");
  const [theme, setTheme] = useState<GlobalStoreCtx["theme"]>("");

  useEffect(() => {
    async function init() {
      const locale = await getRsConfig("locale", "zh");
      const theme = await getRsConfig("theme", "light");
      setLocale(locale);
      setTheme(theme);
      setLoad(true);
    }

    init();
  }, []);
  useEffect(() => {
    if (load && locale) setRsConfig("locale", locale);
  }, [load, locale]);
  useEffect(() => {
    if (load && theme) setRsConfig("theme", theme);
  }, [load, theme]);
  const value = useMemo(
    () => ({
      load,
      theme: theme || "light",
      locale: locale || "zh",
      setLocale,
      setTheme,
    }),
    [load, locale, theme],
  );
  return <ctx.Provider value={value}>{children}</ctx.Provider>;
}

export const useGlobalStore = () => useContext(ctx)!;

export const useStoreValue = <T extends keyof StorePath["store_config.json"]>(
  key: T,
) => {
  const [load, setLoad] = useState(false);
  const [pending, setPending] = useState(false);
  const [value, setValue] = useState<StorePath["store_config.json"][T] | null>(
    null,
  );
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
    async (value: StorePath["store_config.json"][T]) => {
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

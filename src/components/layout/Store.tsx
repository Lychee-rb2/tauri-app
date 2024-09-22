import {
  createContext,
  Dispatch,
  FC,
  PropsWithChildren,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { get, set, StorePath } from "@/tauri/store";

interface GlobalStoreCtx {
  load: boolean;
  locale: "en" | "zh";
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

export function GlobalStore({
  children,
  Fallback,
}: PropsWithChildren<{ Fallback: FC }>) {
  const [load, setLoad] = useState(false);
  const [locale, setLocale] = useState<GlobalStoreCtx["locale"]>("zh");
  const [theme, setTheme] = useState<GlobalStoreCtx["theme"]>("light");

  useEffect(() => {
    async function init() {
      const locale = (await get("store.config..locale")) || "zh";
      const theme = (await get("store.config..theme")) || "light";
      setLocale(locale);
      setTheme(theme);
      setLoad(true);
    }

    init();
  }, []);
  useEffect(() => {
    set("store.config..locale", locale);
  }, [locale]);
  useEffect(() => {
    set("store.config..theme", theme);
  }, [theme]);
  const value = useMemo(
    () => ({
      load,
      theme,
      locale,
      setLocale,
      setTheme,
    }),
    [load, locale, theme],
  );
  if (!load) {
    return <Fallback />;
  }
  return <ctx.Provider value={value}>{children}</ctx.Provider>;
}

export const useGlobalStore = () => useContext(ctx)!;

export const useStoreValue = <
  SP extends keyof StorePath,
  K extends keyof StorePath[SP],
>(
  key: K extends string ? `${SP}..${K}` : never,
) => {
  const [load, setLoad] = useState(false);
  const [pending, setPending] = useState(false);
  const [value, setValue] = useState<StorePath[SP][K] | null>(null);
  const reload = useCallback(
    () =>
      get(key)
        .then((v) => setValue(v))
        .finally(() => setLoad(true)),
    [key],
  );
  useEffect(() => {
    get(key)
      .then((v) => setValue(v))
      .finally(() => setLoad(true));
  }, [key]);
  const update = useCallback(
    async (value: StorePath[SP][K]) => {
      if (pending) return;
      setPending(true);
      await set(key, value);
      setValue(value);
      setPending(false);
    },
    [key, pending],
  );
  return { load, value, setValue: update, pending, reload };
};

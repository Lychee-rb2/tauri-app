"use client";
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
} from "react";
import zh from "./zh";
import en from "./en";
import { useGlobalStore } from "@/components/layout/Store";

export interface I18nProps {
  $t: (key: keyof typeof zh | string) => string;
}
export enum Locale {
  ZH = "zh",
  EN = "en",
  DEFAULT = "zh",
}
const i18n: Record<Locale, Record<string, string>> = {
  [Locale.ZH]: zh,
  [Locale.EN]: en,
};

const ctx = createContext<I18nProps>({
  $t: (key: keyof typeof zh | string) => key,
});

export const I18nProvider = ({ children }: PropsWithChildren) => {
  const { locale } = useGlobalStore();

  const $t = useCallback(
    (key: keyof typeof zh | string) =>
      (i18n[locale] || i18n[Locale.DEFAULT])?.[key] || key,
    [locale],
  );
  const value = useMemo(() => {
    return {
      $t,
    };
  }, [$t]);
  return <ctx.Provider value={value}>{children}</ctx.Provider>;
};

export const useI18n = () =>
  useContext(ctx)?.$t || ((key: string | keyof typeof zh) => key);

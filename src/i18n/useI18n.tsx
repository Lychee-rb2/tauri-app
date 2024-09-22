'use client'
import {createContext, PropsWithChildren, useCallback, useContext, useMemo} from "react";
import zh from './zh'
import en from './en'
import {useGlobalStore} from "@/components/layout/Store";

export interface I18nProps {
  $t: (key: keyof typeof zh | string) => string
}

const i18n: { zh: Record<string, string>, en: Record<string, string> } = {zh, en}

const ctx = createContext<I18nProps>({
  $t: (key: keyof typeof zh | string) => key,
})

export const I18nProvider = ({children}: PropsWithChildren) => {
  const {locale} = useGlobalStore()

  const $t = useCallback((key: keyof typeof zh | string) => i18n[locale]?.[key] || key, [locale])
  const value = useMemo(() => {
    return {
      $t
    }
  }, [$t])
  return <ctx.Provider value={value}>{children}</ctx.Provider>
}

export const useI18n = () => useContext(ctx)?.$t || ((key: string | keyof typeof zh) => key)

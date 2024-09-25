"use client";

import * as React from "react";
import { PropsWithChildren, useEffect } from "react";
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";
import { type ThemeProviderProps } from "next-themes/dist/types";
import { MoonIcon, SunIcon } from "@radix-ui/react-icons";

import { Button } from "@/components/ui/button";
import { useGlobalStore } from "@/components/layout/global-store";
export enum Theme {
  LIGHT = "light",
  DARK = "dark",
  DEFAULT = "light",
}
function ThemeAsync({ children }: PropsWithChildren) {
  const { theme } = useTheme();
  const { setTheme } = useGlobalStore();
  useEffect(() => {
    if (theme) {
      setTheme(theme as Theme);
    }
  }, [setTheme, theme]);
  return <>{children}</>;
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const { theme } = useGlobalStore();

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme={theme}
      disableTransitionOnChange
      {...props}
    >
      <ThemeAsync>{children}</ThemeAsync>
    </NextThemesProvider>
  );
}

export function ModeToggle() {
  const { setTheme, theme } = useTheme();

  return (
    <Button
      onClick={() =>
        theme === Theme.LIGHT ? setTheme(Theme.DARK) : setTheme(Theme.LIGHT)
      }
      variant="ghost"
      size="icon"
      className="relative"
    >
      <SunIcon className="block dark:hidden" />
      <MoonIcon className="hidden dark:block" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}

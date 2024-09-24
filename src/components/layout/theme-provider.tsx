"use client";

import * as React from "react";
import { PropsWithChildren, useEffect } from "react";
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";
import { type ThemeProviderProps } from "next-themes/dist/types";
import { MoonIcon, SunIcon } from "@radix-ui/react-icons";

import { Button } from "@/components/ui/button";
import { useGlobalStore } from "@/components/layout/Store";

function ThemeAsync({ children }: PropsWithChildren) {
  const { theme } = useTheme();
  const { setTheme } = useGlobalStore();
  useEffect(() => {
    if (theme) {
      setTheme(theme);
    }
  }, [setTheme, theme]);
  return <>{children}</>;
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider {...props}>
      <ThemeAsync>{children}</ThemeAsync>
    </NextThemesProvider>
  );
}

export function ModeToggle() {
  const { setTheme, theme } = useTheme();

  return (
    <Button
      onClick={() => (theme === "light" ? setTheme("dark") : setTheme("light"))}
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

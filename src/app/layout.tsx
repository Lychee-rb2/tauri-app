"use client";
import "./globals.css";
import { I18nProvider } from "@/i18n";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { PropsWithChildren, useMemo } from "react";
import { GlobalStore, useGlobalStore } from "@/components/layout/Store";
import { Toaster } from "@/components/ui/toaster";
import { HanSans, jetBrains_Mono, smiley } from "@/app/font";
import { allDeps, CheckProvider } from "@/components/layout/Check";
import { type } from "@tauri-apps/plugin-os";

function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { theme, locale, load } = useGlobalStore();
  const os = useMemo(() => (load ? type() : ""), [load]);
  const deps = useMemo(() => allDeps.filter((i) => i.os.includes(os)), [os]);
  return (
    <html lang={locale} suppressHydrationWarning={true}>
      <body
        className={`flex min-h-screen w-full flex-col antialiased ${smiley.variable} ${jetBrains_Mono.variable} ${HanSans.variable} font-han-sans`}
      >
        {load && (
          <CheckProvider deps={deps}>
            <ThemeProvider
              attribute="class"
              defaultTheme={theme}
              disableTransitionOnChange
            >
              <I18nProvider>
                {children}
                <Toaster />
              </I18nProvider>
            </ThemeProvider>
          </CheckProvider>
        )}
      </body>
    </html>
  );
}

export default function Layout({ children }: PropsWithChildren) {
  return (
    <GlobalStore>
      <RootLayout>{children}</RootLayout>
    </GlobalStore>
  );
}

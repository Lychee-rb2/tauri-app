"use client";
import "./globals.css";
import { DesktopNav, MobileNav } from "@/components/layout/Nav";
import BreadcrumbGroup from "@/components/layout/Breadcrumb";
import { I18nProvider } from "@/i18n";
import Language from "@/components/layout/Language";
import { ModeToggle, ThemeProvider } from "@/components/layout/theme-provider";
import { PropsWithChildren, useEffect, useState } from "react";
import { GlobalStore, useGlobalStore } from "@/components/layout/Store";
import { UpdateIcon } from "@radix-ui/react-icons";
import { Toaster } from "@/components/ui/toaster";
import { HanSans, jetBrains_Mono, smiley } from "@/app/font";

function Fallback() {
  const [pending, setPending] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setPending(true), 1000);
    return () => {
      clearTimeout(timer);
    };
  }, []);
  return (
    <html suppressHydrationWarning={true}>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          disableTransitionOnChange
        >
          <div className="absolute inset-0 flex items-center justify-center">
            {pending && <UpdateIcon className="h-10 w-10 animate-spin" />}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}

function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { theme, locale } = useGlobalStore();
  return (
    <html lang={locale} suppressHydrationWarning={true}>
      <body
        className={`flex min-h-screen w-full flex-col antialiased ${smiley.variable} ${jetBrains_Mono.variable} ${HanSans.variable} font-han-sans`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme={theme}
          disableTransitionOnChange
        >
          <I18nProvider>
            <DesktopNav />
            <main className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
              <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
                <div>
                  <MobileNav />
                  <BreadcrumbGroup />
                </div>
                <div className="flex items-center">
                  <ModeToggle />
                  <Language />
                </div>
              </header>
              <div className="grid flex-1 items-start gap-2 p-4 sm:px-6 sm:py-0 md:gap-4">
                {children}
              </div>
            </main>
            <Toaster />
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

export default function Layout({ children }: PropsWithChildren) {
  return (
    <GlobalStore Fallback={Fallback}>
      <RootLayout>{children}</RootLayout>
    </GlobalStore>
  );
}

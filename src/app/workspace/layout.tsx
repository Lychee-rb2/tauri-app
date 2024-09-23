"use client";
import * as React from "react";
import { PropsWithChildren } from "react";
import { ModeToggle } from "@/components/layout/theme-provider";
import Language from "@/components/layout/Language";
import { GearIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import CheckDialog from "@/components/layout/Check";

export default function Layout({ children }: PropsWithChildren) {
  return (
    <div>
      <header className="fixed inset-x-0 top-0 z-30 flex h-12 items-center justify-between border-0 border-b px-2 py-2">
        <div className="flex w-full items-center justify-end">
          <ModeToggle />
          <Language />
          <Button asChild variant="ghost" size="icon" className="relative">
            <Link href="/">
              <GearIcon />
            </Link>
          </Button>
          <CheckDialog />
        </div>
      </header>
      <main className="fixed inset-x-0 bottom-0 top-12 flex flex-col gap-4 overflow-auto p-4">
        {children}
      </main>
    </div>
  );
}

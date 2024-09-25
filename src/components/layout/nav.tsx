"use client";
import Link from "next/link";
import { GearIcon, HomeIcon, PersonIcon } from "@radix-ui/react-icons";

import { usePathname } from "next/navigation";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n";

export const navs = [
  {
    href: "/workspace",
    icon: HomeIcon,
    text: "home",
  },
  {
    href: "/",
    icon: GearIcon,
    text: "config",
  },
  {
    href: "/config/check",
    icon: PersonIcon,
    text: "check",
  },
];

function DesktopNavItem({ item }: { item: (typeof navs)[number] }) {
  const path = usePathname();
  const $t = useI18n();
  return (
    <Link
      href={item.href}
      className={cn(
        path === item.href
          ? "bg-background"
          : "bg-secondary hover:bg-background/50",
        "flex w-full items-center space-x-3 rounded px-2 py-1 text-xs capitalize",
      )}
    >
      <item.icon />
      <span>{$t(item.text)}</span>
    </Link>
  );
}

export function DesktopNav() {
  return (
    <nav className="flex flex-col items-start gap-1 px-2">
      {navs.map((item) => (
        <DesktopNavItem key={item.href} item={item} />
      ))}
    </nav>
  );
}

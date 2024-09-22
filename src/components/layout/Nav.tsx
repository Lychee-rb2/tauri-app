'use client'
import {Button} from "@/components/ui/button";
import Link from "next/link";
import {CrossCircledIcon, GearIcon, HamburgerMenuIcon, HomeIcon, PersonIcon} from "@radix-ui/react-icons";

import {usePathname} from 'next/navigation'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
  DrawerTrigger
} from "@/components/ui/drawer";
import Panel from "@/components/ui/panel";
import {cn} from "@/lib/utils";
import {useI18n} from "@/i18n";
import * as React from "react";

export const navs = [
  {
    href: "/",
    icon: HomeIcon,
    text: "home"
  },
  {
    href: "/config",
    icon: GearIcon,
    text: "config"
  },
  {
    href: '/config/check',
    icon: PersonIcon,
    text: "check"
  },
]

function DesktopNavItem({item}: { item: (typeof navs)[number] }) {
  const path = usePathname()

  return <Button asChild size="icon" variant={path === item.href ? "default" : 'ghost'}>
    <Link href={item.href}>
      <item.icon/>
    </Link>
  </Button>
}

function MobileNavItem({item}: { item: (typeof navs)[number] }) {
  const path = usePathname()
  const $t = useI18n()
  return <DrawerClose asChild>
    <Link href={item.href}
          className={cn("flex items-center gap-4 px-2.5  hover:text-foreground",
            item.href === path ? "text-foreground" : "text-muted-foreground")
          }>
      <item.icon/>
      <span className="first-letter:uppercase">{$t(item.text)}</span>
    </Link>
  </DrawerClose>
}

export function MobileNav() {
  return <Drawer direction="left">
    <DrawerTrigger asChild>
      <Button size='icon' variant='ghost' className="sm:hidden">
        <HamburgerMenuIcon/>
      </Button>
    </DrawerTrigger>
    <DrawerContent className="bg-background w-80">
      <DrawerTitle>
        <span className="sr-only">nav</span>
      </DrawerTitle>
      <DrawerDescription>
        <span className="sr-only">nav</span>
      </DrawerDescription>
      <Panel>
        <DrawerClose asChild>
          <div className="flex justify-end">
            <Button size="icon" variant="ghost">
              <CrossCircledIcon/>
            </Button>
          </div>
        </DrawerClose>
        <div className="flex flex-col space-y-4 mt-4">
          {navs.map((item => <MobileNavItem key={item.href} item={item}/>))}
        </div>
      </Panel>
    </DrawerContent>
  </Drawer>
}

export function DesktopNav() {
  return <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
    <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
      {navs.map((item => <DesktopNavItem key={item.href} item={item}/>))}
    </nav>
  </aside>
}


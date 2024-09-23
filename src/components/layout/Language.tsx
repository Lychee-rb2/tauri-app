"use client";
import { useI18n } from "@/i18n";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import * as React from "react";
import { useGlobalStore } from "@/components/layout/Store";
import { GlobeIcon } from "@radix-ui/react-icons";

export default function Language() {
  const $t = useI18n();
  const { setLocale, locale } = useGlobalStore();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost">
          <GlobeIcon />
          <span className="sr-only">{$t(locale)}</span>
          <span className="sr-only">Toggle language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => setLocale("zh")}>
          {$t("zh")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLocale("en")}>
          {$t("en")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

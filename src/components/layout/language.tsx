"use client";
import { Locale, useI18n } from "@/i18n";
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

export function Language() {
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
        <DropdownMenuItem onClick={() => setLocale(Locale.ZH)}>
          {$t("zh")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLocale(Locale.EN)}>
          {$t("en")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

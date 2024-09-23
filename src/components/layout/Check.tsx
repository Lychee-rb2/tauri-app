"use client";

import { FC, useEffect, useState } from "react";
import { run } from "@/tauri/shell";
import { type } from "@tauri-apps/plugin-os";
import {
  CheckIcon,
  Cross2Icon,
  GitHubLogoIcon,
  SymbolIcon,
  DownloadIcon,
  QuestionMarkIcon,
} from "@radix-ui/react-icons";
import { CommandLineIcon } from "@heroicons/react/16/solid";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n";
import { Code, CodeBlock } from "@/components/ui/code";
import { Dialog, DialogTrigger } from "@radix-ui/react-dialog";
import { DialogContent, DialogTitle } from "@/components/ui/dialog";

interface Dep {
  icon: FC;
  cmd: string;
  label: string;
  os: string[];
  site: string;
}

const allDeps: Dep[] = [
  {
    icon: () => <CommandLineIcon width={16} height={16} />,
    cmd: "Get-Host | Format-Wide -Property Version",
    label: "pwsh",
    os: ["windows"],
    site: "https://learn.microsoft.com/en-us/powershell/scripting/install/installing-powershell-on-windows?view=powershell-7.4",
  },
  {
    icon: () => <CommandLineIcon width={16} height={16} />,
    cmd: "zsh --version",
    label: "zsh",
    os: ["macos", "linux"],
    site: "https://github.com/ohmyzsh/ohmyzsh/wiki/Installing-ZSH",
  },
  {
    icon: () => <GitHubLogoIcon width={16} height={16} />,
    cmd: "git --version",
    label: "git",
    os: ["macos", "linux", "windows"],
    site: "https://git-scm.com/",
  },
];

function CheckDep({
  dep: { label, cmd, icon: Icon, site },
  check,
}: {
  dep: Dep;
  check?: (state: "pending" | "fail" | "success") => void;
}) {
  const [version, setVersion] = useState<string>("");
  const [load, setLoad] = useState(false);
  const [error, setError] = useState(false);
  const $t = useI18n();
  useEffect(() => {
    run(cmd)
      .then((res) => {
        setVersion(res);
        setError(false);
      })
      .catch(() => {
        setError(true);
      })
      .finally(() => {
        setLoad(true);
      });
  }, [check, cmd]);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="mb-2 flex items-center space-x-2">
          <Icon />
          <span>{label}</span>
          {!load ? (
            <SymbolIcon className="animate-spin" />
          ) : error ? (
            <Cross2Icon className="text-red-500" width={16} height={16} />
          ) : (
            <CheckIcon className="text-green-500" width={16} height={16} />
          )}
        </div>
        {load && error && (
          <Button
            variant="link"
            size="sm"
            className="space-x-2"
            onClick={() => {
              open(site);
            }}
          >
            <DownloadIcon width={16} height={16} />
            <span> {$t("download")} </span>
          </Button>
        )}
      </div>
      <CodeBlock size="sm">
        <Code variant="cmd" content={cmd} />
        {load && !error && <Code content={version} />}
      </CodeBlock>
    </div>
  );
}

export function Check({}: {}) {
  return (
    <>
      {allDeps
        .filter((i) => i.os.includes(type()))
        .map((dep) => (
          <CheckDep key={dep.label} dep={dep} />
        ))}
    </>
  );
}

export default function CheckDialog() {
  const $t = useI18n();
  return (
    <Dialog>
      <DialogTrigger>
        <Button variant="ghost" size="icon">
          <QuestionMarkIcon />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>{$t("Check")}</DialogTitle>
        <Check />
      </DialogContent>
    </Dialog>
  );
}

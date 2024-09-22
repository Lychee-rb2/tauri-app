"use client";

import { useEffect, useState } from "react";
import { run } from "@/tauri/shell";
import { type } from "@tauri-apps/plugin-os";
import {
  CheckIcon,
  Cross2Icon,
  GitHubLogoIcon,
  SymbolIcon,
} from "@radix-ui/react-icons";
import { CommandLineIcon } from "@heroicons/react/16/solid";
import { useStoreValue } from "@/components/layout/Store";
import { Button } from "@/components/ui/button";
import { DownloadIcon } from "lucide-react";
import { useI18n } from "@/i18n";
import { Code, CodeBlock } from "@/components/ui/code";

const deps = [
  {
    icon: <CommandLineIcon width={16} height={16} />,
    cmd: "Get-Host | Format-Wide -Property Version",
    label: "pwsh",
    os: ["windows"],
    site: "https://learn.microsoft.com/en-us/powershell/scripting/install/installing-powershell-on-windows?view=powershell-7.4",
  },
  {
    icon: <CommandLineIcon width={16} height={16} />,
    cmd: "zsh --version",
    label: "zsh",
    os: ["macos", "linux"],
    site: "https://github.com/ohmyzsh/ohmyzsh/wiki/Installing-ZSH",
  },
  {
    icon: <GitHubLogoIcon width={16} height={16} />,
    cmd: "git --version",
    label: "git",
    os: ["macos", "linux", "windows"],
    site: "https://git-scm.com/",
  },
];

function CheckDep({
  dep: { label, cmd, icon, site },
}: {
  dep: (typeof deps)[number];
}) {
  const [version, setVersion] = useState<string>("");
  const [load, setLoad] = useState(false);
  const [error, setError] = useState(false);
  const $t = useI18n();
  useEffect(() => {
    run(cmd)
      .then((res) => {
        setVersion(res.stdout);
        setError(false);
      })
      .catch(() => {
        setError(true);
      })
      .finally(() => {
        setLoad(true);
      });
  }, [cmd]);
  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="mb-2 flex items-center space-x-2">
          {icon}
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

export default function Check() {
  const { load } = useStoreValue("store.config..workspace");
  if (!load) return;
  return (
    <div className="flex flex-col space-y-6">
      {deps
        .filter((i) => i.os.includes(type()))
        .map((dep, index) => (
          <CheckDep key={index} dep={dep} />
        ))}
    </div>
  );
}

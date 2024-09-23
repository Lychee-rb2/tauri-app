"use client";

import {
  createContext,
  FC,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { run } from "@/tauri/shell";
import {
  CheckIcon,
  Cross2Icon,
  DownloadIcon,
  GitHubLogoIcon,
  QuestionMarkIcon,
  SymbolIcon,
} from "@radix-ui/react-icons";
import { CommandLineIcon } from "@heroicons/react/16/solid";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n";
import { Code, CodeBlock } from "@/components/ui/code";
import { Dialog, DialogTrigger } from "@radix-ui/react-dialog";
import { DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface Dep {
  icon: FC;
  cmd: string;
  label: string;
  os: string[];
  site: string;
}

export const allDeps: Dep[] = [
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

interface DepState {
  error: boolean;
  load: boolean;
  version: string;
}

interface CheckState {
  states: Record<string, DepState>;
  allState: "pending" | "success" | "error";
}

const CheckContext = createContext<CheckState>({
  states: {},
  allState: "pending",
});

export const CheckProvider = ({
  children,
  deps,
}: PropsWithChildren<{ deps: Omit<Dep, "icon">[] }>) => {
  const [states, setStates] = useState<CheckState["states"]>({});
  useEffect(() => {
    setStates(
      deps.reduce<CheckState["states"]>((pre, cur) => {
        pre[cur.label] = {
          error: false,
          load: false,
          version: "",
        };
        return pre;
      }, {}),
    );
  }, [deps]);
  const update = useCallback((dep: Omit<Dep, "icon">) => {
    setStates((pre) => ({
      ...pre,
      [dep.label]: { load: false, error: false, version: "" },
    }));
    run(dep.cmd)
      .then((res) => {
        setStates((pre) => ({
          ...pre,
          [dep.label]: { load: true, error: false, version: res },
        }));
      })
      .catch(() => {
        setStates((pre) => ({
          ...pre,
          [dep.label]: { load: true, error: true, version: "" },
        }));
      });
  }, []);
  useEffect(() => {
    deps.forEach((dep) => {
      update(dep);
    });
  }, [deps, update]);
  const allState = useMemo<CheckState["allState"]>(() => {
    if (Object.values(states).some((i) => i.error)) {
      return "error";
    }
    if (Object.values(states).every((i) => i.load)) {
      return "success";
    }
    return "pending";
  }, [states]);
  const value = useMemo(() => ({ states, allState }), [states, allState]);
  return (
    <CheckContext.Provider value={value}>{children}</CheckContext.Provider>
  );
};

export const useCheck = () => useContext(CheckContext);

function CheckDep({ label, state }: { label: string; state: DepState }) {
  const $t = useI18n();
  const dep = allDeps.find((i) => i.label === label);
  if (!dep) return <></>;
  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="mb-2 flex items-center space-x-2">
          {dep.icon && <dep.icon />}
          <span>{dep.label}</span>
          {!state.load ? (
            <SymbolIcon className="animate-spin" />
          ) : state.error ? (
            <Cross2Icon className="text-red-500" width={16} height={16} />
          ) : (
            <CheckIcon className="text-green-500" width={16} height={16} />
          )}
        </div>
        {state.load && state.error && (
          <Button
            variant="link"
            size="sm"
            className="space-x-2"
            onClick={() => {
              open(dep.site);
            }}
          >
            <DownloadIcon width={16} height={16} />
            <span> {$t("download")} </span>
          </Button>
        )}
      </div>
      <CodeBlock size="sm">
        <Code variant="cmd" content={dep.cmd} />
        {state.load && !state.error && <Code content={state.version} />}
      </CodeBlock>
    </div>
  );
}

export function Check({}: {}) {
  const { states } = useCheck();
  return (
    <>
      {Object.entries(states).map(([label, state]) => (
        <CheckDep key={label} label={label} state={state} />
      ))}
    </>
  );
}

export default function CheckDialog() {
  const $t = useI18n();
  const { allState } = useCheck();
  return (
    <Dialog>
      <DialogTrigger>
        <Button variant="ghost" size="icon">
          <div className="relative">
            <QuestionMarkIcon />
            <span
              className={cn(
                "absolute -right-1.5 -top-1.5 h-1.5 w-1.5 rounded-full",
                allState === "error" && "bg-red-500",
                allState === "success" && "bg-green-500",
                allState === "pending" && "bg-yellow-500",
              )}
            />
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle className="flex items-center space-x-2">
          <span>{$t("Check")}</span>
          {allState === "pending" ? (
            <SymbolIcon className="animate-spin" />
          ) : allState === "error" ? (
            <Cross2Icon className="text-red-500" width={16} height={16} />
          ) : (
            <CheckIcon className="text-green-500" width={16} height={16} />
          )}
        </DialogTitle>
        <Check />
      </DialogContent>
    </Dialog>
  );
}

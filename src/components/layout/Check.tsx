"use client";

import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  CheckIcon,
  Cross2Icon,
  QuestionMarkIcon,
  SymbolIcon,
} from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n";
import { Code, CodeBlock } from "@/components/ui/code";
import { Dialog, DialogTrigger } from "@radix-ui/react-dialog";
import { DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { invoke, InvokeFn } from "@/tauri/invoke";

interface DepState {
  error: boolean;
  load: boolean;
  version: string;
  cmd: string;
}

interface CheckState {
  states: Record<string, DepState>;
  allState: "pending" | "success" | "error";
}

const CheckContext = createContext<CheckState>({
  states: {},
  allState: "pending",
});

export const CheckProvider = ({ children }: PropsWithChildren) => {
  const [states, setStates] = useState<CheckState["states"]>({});
  const update = useCallback((dep: string) => {
    setStates((pre) => ({
      ...pre,
      [dep]: { ...pre[dep], load: false, error: false, version: "" },
    }));
    invoke(InvokeFn.CHECK_DEP, { dep })
      .then((res) => {
        setStates((pre) => ({
          ...pre,
          [dep]: { ...pre[dep], load: true, error: false, version: res.trim() },
        }));
      })
      .catch(() => {
        setStates((pre) => ({
          ...pre,
          [dep]: { ...pre[dep], load: true, error: true, version: "" },
        }));
      });
  }, []);
  useEffect(() => {
    invoke(InvokeFn.FIND_DEPS).then(async (res) => {
      const _states = res.reduce<CheckState["states"]>((pre, cur) => {
        pre[cur.dep] = { error: false, load: false, cmd: cur.cmd, version: "" };
        return pre;
      }, {});
      setStates(_states);
      res.forEach((i) => update(i.dep));
    });
  }, [update]);
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
  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="mb-1 flex items-center space-x-2">
          <span>{label}</span>
          {!state.load ? (
            <SymbolIcon className="animate-spin" />
          ) : state.error ? (
            <Cross2Icon className="text-red-500" width={16} height={16} />
          ) : (
            <CheckIcon className="text-green-500" width={16} height={16} />
          )}
        </div>
      </div>
      <CodeBlock size="sm">
        <Code variant="cmd" content={state.cmd} />
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
        <Button variant="ghost" size="icon" asChild>
          <div className="relative">
            <QuestionMarkIcon />
            <span
              className={cn(
                "absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full",
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

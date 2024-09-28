"use client";

import {
  useGlobalStore,
  useStoreValue,
} from "@/components/layout/global-store";
import { useEffect } from "react";
import { Code, CodeBlock } from "@/components/ui/code";
import { Button } from "@/components/ui/button";
import { UpdateIcon } from "@radix-ui/react-icons";
import { InvokeFn, useInvoke } from "@/tauri/invoke";
import { StoreKey } from "@/tauri/store";

const cmd = "git status -sb";
const GitStatus = () => {
  const { setBranch } = useGlobalStore();
  const { load, value } = useStoreValue(StoreKey.WORKSPACE, "");
  const { data, pending, run } = useInvoke(InvokeFn.GIT_STATUS, false);
  useEffect(() => {
    setBranch(data?.branch || "");
  }, [data?.branch, setBranch]);
  const [ahead, behind] = data?.commitDistance?.split("\t")?.map((i) => +i) || [
    0, 0,
  ];
  useEffect(() => {
    if (load) {
      run();
    }
  }, [load, run]);
  if (!load || !value) return;
  return (
    <div>
      <CodeBlock size="sm">
        <div className="flex items-center">
          <Code variant="title" content={value} />
          {!!data?.branch && (
            <div className="space-x-2 font-jb-mono text-yellow-700 dark:text-yellow-300">
              <span>{data.branch}</span>
              {!!data?.commitDistance && (
                <>
                  <span>↑{ahead}</span>
                  <span>↓{behind}</span>
                </>
              )}
            </div>
          )}
        </div>

        <Code variant="cmd" content={cmd} />
        {(data?.status || "")
          .split("\n")
          .map((i) => i.trim())
          .filter(Boolean)
          .map((line, index) => (
            <Code key={index} content={line} />
          ))}
      </CodeBlock>
      <Button
        onClick={run}
        variant="outline"
        size="icon"
        className="fixed bottom-2 left-2 rounded-full hover:animate-spin"
      >
        <UpdateIcon />
      </Button>
    </div>
  );
};

export default function Home() {
  return (
    <div className="flex flex-col space-y-4">
      <GitStatus />
    </div>
  );
}

"use client";

import { useStoreValue } from "@/components/layout/Store";
import { useCallback, useEffect, useState } from "react";
import { Code, CodeBlock } from "@/components/ui/code";
import { Button } from "@/components/ui/button";
import { UpdateIcon } from "@radix-ui/react-icons";
import { invoke, InvokeFn } from "@/tauri/invoke";
import { StoreKey } from "@/tauri/store";

const cmd = "git status -sb";
const GitStatus = () => {
  const { load, value } = useStoreValue(StoreKey.WORKSPACE);
  const [stdout, setStdout] = useState<string[]>([]);
  const init = useCallback(() => {
    if (value) {
      invoke(InvokeFn.GIT_STATUS).then((res) => {
        setStdout(
          res
            .split("\n")
            .map((i) => i.trim())
            .filter(Boolean),
        );
      });
    }
  }, [value]);
  useEffect(() => {
    if (load) {
      init();
    }
  }, [init, load]);
  if (!load || !value) return;
  return (
    <div>
      <CodeBlock size="sm">
        <Code variant="title" content={value} />
        <Code variant="cmd" content={cmd} />
        {stdout.map((line, index) => (
          <Code key={index} content={line} />
        ))}
      </CodeBlock>
      <Button
        onClick={init}
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

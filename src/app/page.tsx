"use client";

import { useStoreValue } from "@/components/layout/Store";
import { useEffect, useState } from "react";
import { run } from "@/tauri/shell";
import { Code, CodeBlock } from "@/components/ui/code";

const cmd = "git status -sb";
const GitStatus = () => {
  const { load, value } = useStoreValue("store.config..workspace");
  const [stdout, setStdout] = useState<string[]>([]);
  useEffect(() => {
    console.log({ value });
    if (load && value) {
      run(cmd, value).then((res) => {
        setStdout(res.stdout.split("\n"));
      });
    }
  }, [load, value]);
  if (!load || !value) return;
  return (
    <CodeBlock size="sm">
      <Code variant="title" content={value} />
      <Code variant="cmd" content={cmd} />
      {stdout.map((line, index) => (
        <Code key={index} content={line} />
      ))}
    </CodeBlock>
  );
};

export default function Home() {
  return (
    <div className="flex flex-col space-y-4">
      <GitStatus />
    </div>
  );
}

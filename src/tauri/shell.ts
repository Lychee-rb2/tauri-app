import { Command } from "@tauri-apps/plugin-shell";
import { type } from "@tauri-apps/plugin-os";
async function _run(...props: Parameters<(typeof Command)["create"]>) {
  const res = await Command.create(...props).execute();
  if (res.code !== 0) {
    throw new Error(res.stderr);
  }
  return res.stdout;
}
function resolveCmd(): [string, string] {
  const os = type();
  switch (os) {
    case "windows": {
      return ["pwsh", "/C"];
    }
    case "linux":
    case "macos": {
      return ["zsh", "-c"];
    }
    default: {
      throw new Error(`Unknown command ${os}`);
    }
  }
}
export async function run(cmd: string, cwd?: string) {
  const [program, prefix] = resolveCmd();
  return _run(program, [prefix, cmd], { encoding: "utf-8", cwd });
}

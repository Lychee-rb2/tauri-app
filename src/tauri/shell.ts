import {Command} from '@tauri-apps/plugin-shell';
import {type} from '@tauri-apps/plugin-os'


export async function run(cmd: string, cwd?: string) {
  const os = type()
  switch (os) {
    case "windows": {
      return Command.create('pwsh', ["/C", cmd], {encoding: 'utf-8', cwd}).execute()
    }
    case "linux":
    case "macos": {
      return Command.create('zsh', ["-c", cmd], {encoding: 'utf-8', cwd}).execute()
    }
    default: {
      throw new Error(`Unknown command ${cmd}`)
    }
  }
}

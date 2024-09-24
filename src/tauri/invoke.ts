import {
  invoke as _invoke,
  InvokeArgs,
  InvokeOptions,
} from "@tauri-apps/api/core";

export enum InvokeFn {
  GIT_STATUS = "git_status",
  GET_CONFIG = "get_config",
  SET_CONFIG = "set_config",
}
export const invoke = <T = string>(
  cmd: InvokeFn,
  args?: InvokeArgs,
  options?: InvokeOptions,
) => _invoke<T>(cmd, args, options);

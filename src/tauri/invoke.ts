import {
  invoke as _invoke,
  InvokeArgs,
  InvokeOptions,
} from "@tauri-apps/api/core";

export enum InvokeFn {
  GIT_STATUS = "git_status",
  GET_CONFIG = "get_config",
  SET_CONFIG = "set_config",
  GIT_ROOT = "git_root",
  FIND_DEPS = "find_deps",
  CHECK_DEP = "check_dep",
}
interface InvokeResult {
  [InvokeFn.FIND_DEPS]: { dep: string; cmd: string }[];
}
export const invoke = <
  K extends InvokeFn,
  T extends K extends keyof InvokeResult ? InvokeResult[K] : string,
>(
  cmd: K,
  args?: InvokeArgs,
  options?: InvokeOptions,
) =>
  _invoke<T>(cmd, args, options).then((res) => {
    console.log(cmd, args, res);
    return res;
  });

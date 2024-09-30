import {
  invoke as _invoke,
  InvokeArgs,
  InvokeOptions,
} from "@tauri-apps/api/core";
import { useCallback, useEffect, useState } from "react";

export enum InvokeFn {
  GIT_STATUS = "git_status",
  GET_CONFIG = "get_config",
  SET_CONFIG = "set_config",
  GIT_ROOT = "git_root",
  FIND_DEPS = "find_deps",
  CHECK_DEP = "check_dep",
  GET_PROJECTS = "get_projects",
  GIT_ADD_SAFE_DIRECTORY = "git_add_safe_directory",
}

interface InvokeResult {
  [InvokeFn.FIND_DEPS]: { dep: string; cmd: string }[];
  [InvokeFn.GIT_STATUS]: {
    status: string;
    branch: string;
    remoteBranch: string;
    commitDistance: string;
  };
}

type Result<K> = K extends keyof InvokeResult ? InvokeResult[K] : string;
export const invoke = <K extends InvokeFn, T extends Result<K>>(
  cmd: K,
  args?: InvokeArgs,
  options?: InvokeOptions,
) =>
  _invoke<T>(cmd, args, options)
    .then((res) => {
      console.log(cmd, args, res);
      return res;
    })
    .catch((e) => {
      console.error(e);
      throw e;
    });

export const useInvoke = <K extends InvokeFn>(
  cmd: K,
  initRun = true,
  args?: InvokeArgs,
  options?: InvokeOptions,
) => {
  const [pending, setPending] = useState(true);
  const [data, setData] = useState<Result<K>>();
  const run = useCallback(() => {
    setPending(true);
    invoke<K, Result<K>>(cmd, args, options)
      .then((res) => {
        setData(res);
      })
      .catch((e) => {
        console.log({ e });
      })
      .finally(() => {
        setPending(false);
      });
  }, [args, cmd, options]);
  useEffect(() => {
    if (initRun) {
      run();
    }
  }, [initRun, run]);
  return { pending, data, run };
};

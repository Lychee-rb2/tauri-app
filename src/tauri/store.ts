import { invoke, InvokeFn } from "@/tauri/invoke";

export interface StorePath {
  "store_config.json": {
    locale: string;
    theme: string;
    workspace: string;
    vercel_team: string;
    vercel_token: string;
  };
}

const getRsConfig = <T extends keyof StorePath["store_config.json"]>(
  key: T,
  defaultValue: StorePath["store_config.json"][T],
) =>
  invoke<StorePath["store_config.json"][T]>(InvokeFn.GET_CONFIG, { key }).then(
    (res) => res ?? defaultValue,
  );

const setRsConfig = <T extends keyof StorePath["store_config.json"]>(
  key: T,
  value: StorePath["store_config.json"][T],
) =>
  invoke<StorePath["store_config.json"][T]>(InvokeFn.SET_CONFIG, {
    key,
    value,
  });

export { getRsConfig, setRsConfig };

import { invoke } from "@tauri-apps/api/core";

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
  invoke<StorePath["store_config.json"][T]>("get_config", { key }).then(
    (res) => res ?? defaultValue,
  );

const setRsConfig = <T extends keyof StorePath["store_config.json"]>(
  key: T,
  value: StorePath["store_config.json"][T],
) => invoke<StorePath["store_config.json"][T]>("set_config", { key, value });

export { getRsConfig, setRsConfig };

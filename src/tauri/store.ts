import { invoke, InvokeFn } from "@/tauri/invoke";

export enum StoreKey {
  LOCALE = "locale",
  THEME = "theme",
  WORKSPACE = "workspace",
  VERCEL_TEAM = "vercel_team",
  VERCEL_TOKEN = "vercel_token",
}

const getRsConfig = <T extends string>(key: StoreKey, defaultValue: string) =>
  invoke<InvokeFn.GET_CONFIG, T>(InvokeFn.GET_CONFIG, { key }).then(
    (res) => res ?? defaultValue,
  );

const setRsConfig = <T extends string>(key: StoreKey, value: string) =>
  invoke<InvokeFn.SET_CONFIG, T>(InvokeFn.SET_CONFIG, { key, value });

export { getRsConfig, setRsConfig };

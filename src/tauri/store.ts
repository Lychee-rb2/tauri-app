import { invoke, InvokeFn } from "@/tauri/invoke";

export enum StoreKey {
  LOCALE = "locale",
  THEME = "theme",
  WORKSPACE = "workspace",
  VERCEL_TEAM = "vercel_team",
  VERCEL_TOKEN = "vercel_token",
}

const rsConfig = <T extends string>(key: StoreKey) => ({
  get: (defaultValue: T) =>
    invoke<InvokeFn.GET_CONFIG, T>(InvokeFn.GET_CONFIG, { key }).then(
      (res) => res ?? defaultValue,
    ),
  set: (value: string) =>
    invoke<InvokeFn.SET_CONFIG, T>(InvokeFn.SET_CONFIG, { key, value }),
});

export { rsConfig };

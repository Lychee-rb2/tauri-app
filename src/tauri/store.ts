import { Store } from "@tauri-apps/plugin-store";

export interface StorePath {
  "store.config": {
    locale: "zh" | "en";
    theme: string;
    workspace: string;
    ["vercel-team"]: string;
    ["vercel-token"]: string;
  };
}

const get = <SP extends keyof StorePath, K extends keyof StorePath[SP]>(
  key: K extends string ? `${SP}..${K}` : never,
) => {
  const [path, _key] = key.split("..");
  return new Store(path).get<StorePath[SP][K]>(_key);
};

const set = async <SP extends keyof StorePath, K extends keyof StorePath[SP]>(
  key: K extends string ? `${SP}..${K}` : never,
  value: StorePath[SP][K],
) => {
  const [path, _key] = key.split("..");
  await new Store(path).set(_key, value);
  await new Store(path).save();
};

export { get, set };

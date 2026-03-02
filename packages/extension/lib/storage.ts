import type { Settings } from "@/lib/types.ts";

export const backendUrl = storage.defineItem<string>("sync:backendUrl", {
  fallback: "https://zitiernudel.lachsnudel.space",
});

export const apiKey = storage.defineItem<string>("sync:apiKey", {
  fallback: "",
});

export const getSettings = async (): Promise<Settings> => {
  const [url, key] = await Promise.all([
    backendUrl.getValue(),
    apiKey.getValue(),
  ]);

  return { backendUrl: url, apiKey: key };
};

export const saveSettings = async (settings: Settings): Promise<void> => {
  await Promise.all([
    backendUrl.setValue(settings.backendUrl),
    apiKey.setValue(settings.apiKey),
  ]);
};

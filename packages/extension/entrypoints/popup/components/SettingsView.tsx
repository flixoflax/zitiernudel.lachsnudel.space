import { type JSX, useEffect, useState } from "react";
import { getSettings, saveSettings } from "@/lib/storage.ts";

interface SettingsViewProps {
  onClose: () => void;
}

export const SettingsView = ({ onClose }: SettingsViewProps): JSX.Element => {
  const [backendUrl, setBackendUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Load current settings on mount
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    getSettings().then((s) => {
      setBackendUrl(s.backendUrl);
      setApiKey(s.apiKey);
    });
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveSettings({
        backendUrl: backendUrl.trim(),
        apiKey: apiKey.trim(),
      });
      setIsSaved(true);
      setTimeout(() => {
        setIsSaved(false);
      }, 2000);
    } catch (error) {
      console.error("[SettingsView] Save failed:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-zinc-900">Einstellungen</h2>
        <button
          type="button"
          className="text-zinc-400 hover:text-zinc-600 transition-colors cursor-pointer"
          aria-label="Schliessen"
          onClick={onClose}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-4 w-4"
          >
            <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
          </svg>
        </button>
      </div>

      {/* Backend URL */}
      <label className="flex flex-col gap-1">
        <span className="text-xs font-medium text-zinc-600">Backend-URL</span>
        <input
          type="url"
          value={backendUrl}
          placeholder="https://zitiernudel.lachsnudel.space"
          className="rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-800 placeholder:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:border-transparent"
          onChange={(e) => {
            setBackendUrl(e.target.value);
          }}
        />
      </label>

      {/* API Key */}
      <label className="flex flex-col gap-1">
        <span className="text-xs font-medium text-zinc-600">
          API-Key <span className="text-zinc-400">(optional)</span>
        </span>
        <input
          type="password"
          value={apiKey}
          placeholder="sk-..."
          className="rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-800 font-mono placeholder:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:border-transparent"
          onChange={(e) => {
            setApiKey(e.target.value);
          }}
        />
      </label>

      {/* Save */}
      <button
        type="button"
        disabled={isSaving}
        className="w-full rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800 active:bg-zinc-700 disabled:opacity-50 transition-colors cursor-pointer"
        onClick={handleSave}
      >
        {/* eslint-disable-next-line no-nested-ternary */}
        {isSaved ? "Gespeichert!" : isSaving ? "Speichern..." : "Speichern"}
      </button>
    </div>
  );
};

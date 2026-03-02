/* eslint-disable react-you-might-not-need-an-effect/no-derived-state */
import { type JSX, useEffect, useRef, useState } from "react";
import type { BibTeXResponse } from "@/lib/types.ts";

interface ResultViewProps {
  response: BibTeXResponse;
  onRegenerate: () => void;
}

export const ResultView = ({
  response,
  onRegenerate,
}: ResultViewProps): JSX.Element => {
  const [isCopied, setIsCopied] = useState(false);
  const [value, setValue] = useState(response.bibtex);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    } catch (error) {
      console.error("[ResultView] Clipboard write failed:", error);
    }
  };

  // Auto-copy on first render
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    copyToClipboard(response.bibtex);
  }, [response.bibtex]);

  // Keep textarea in sync when response changes
  useEffect(() => {
    setValue(response.bibtex);
  }, [response.bibtex]);

  // Get confidence color
  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case "high": {
        return "text-emerald-700 bg-emerald-50 border-emerald-200";
      }
      case "medium": {
        return "text-amber-700 bg-amber-50 border-amber-200";
      }
      case "low": {
        return "text-orange-700 bg-orange-50 border-orange-200";
      }
      default: {
        return "text-zinc-700 bg-zinc-50 border-zinc-200";
      }
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Metadata */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-zinc-500">
            <span className="font-medium text-zinc-700">Schlüssel:</span>{" "}
            {response.citeKey}
          </span>
          <span
            className={`px-2 py-0.5 rounded border text-xs font-medium ${getConfidenceColor(response.confidence)}`}
          >
            {response.confidence}
          </span>
        </div>
        <div className="text-xs text-zinc-500">
          <span className="font-medium text-zinc-700">Typ:</span>{" "}
          {response.entryType}
        </div>
      </div>

      {/* Warnings */}
      {response.warnings.length > 0 && (
        <div className="rounded-md bg-amber-50 border border-amber-200 px-3 py-2">
          <p className="text-xs font-medium text-amber-900 mb-1">Hinweise:</p>
          <ul className="text-xs text-amber-700 space-y-0.5 list-disc list-inside">
            {response.warnings.map((warning, index) => (
              <li key={index}>{warning}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Toast */}
      {isCopied && (
        <div className="rounded-md bg-emerald-50 border border-emerald-200 px-3 py-1.5 text-xs text-emerald-700 text-center animate-fade-in">
          In Zwischenablage kopiert!
        </div>
      )}

      {/* Editable BibTeX textarea */}
      <textarea
        ref={textareaRef}
        value={value}
        rows={10}
        spellCheck={false}
        className="w-full rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs font-mono text-zinc-800 leading-relaxed resize-y focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:border-transparent"
        onChange={(e) => {
          setValue(e.target.value);
        }}
      />

      {/* Footnote Example */}
      <div className="rounded-md bg-blue-50 border border-blue-200 px-3 py-2">
        <p className="text-xs font-medium text-blue-900 mb-1">
          LaTeX-Beispiel:
        </p>
        <code className="text-xs text-blue-700 font-mono break-all">
          {response.footnoteExample}
        </code>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          type="button"
          className="flex-1 rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 active:bg-zinc-100 transition-colors cursor-pointer"
          onClick={async () => {
            await copyToClipboard(value);
          }}
        >
          Kopieren
        </button>
        <button
          type="button"
          className="flex-1 rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800 active:bg-zinc-700 transition-colors cursor-pointer"
          onClick={onRegenerate}
        >
          Nochmal
        </button>
      </div>
    </div>
  );
};

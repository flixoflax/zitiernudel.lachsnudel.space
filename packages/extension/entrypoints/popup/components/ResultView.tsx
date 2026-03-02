/* eslint-disable react-you-might-not-need-an-effect/no-derived-state */
import { type JSX, useEffect, useRef, useState } from "react";

interface ResultViewProps {
  bibtex: string;
  onRegenerate: () => void;
}

export const ResultView = ({
  bibtex,
  onRegenerate,
}: ResultViewProps): JSX.Element => {
  const [isCopied, setIsCopied] = useState(false);
  const [value, setValue] = useState(bibtex);
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
    copyToClipboard(bibtex);
  }, [bibtex]);

  // Keep textarea in sync when bibtex prop changes
  useEffect(() => {
    setValue(bibtex);
  }, [bibtex]);

  return (
    <div className="flex flex-col gap-3">
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

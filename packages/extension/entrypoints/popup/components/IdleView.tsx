import type { JSX } from "react";
import type { PageData } from "@/lib/types.ts";

interface IdleViewProps {
  pageData: PageData;
  onGenerate: () => void;
}

export const IdleView = ({
  pageData,
  onGenerate,
}: IdleViewProps): JSX.Element => {
  const hasSelection = Boolean(pageData.selectedText);

  return (
    <div className="flex flex-col gap-3">
      {/* Page info */}
      <div className="space-y-1">
        <h2 className="text-sm font-semibold text-zinc-900 leading-snug line-clamp-2">
          {pageData.title || "Ohne Titel"}
        </h2>
        <p className="text-xs text-zinc-400 truncate">{pageData.url}</p>
      </div>

      {/* Selection preview */}
      <div className="rounded-md bg-zinc-50 border border-zinc-200 px-3 py-2">
        {hasSelection ? (
          <>
            <p className="text-xs font-medium text-zinc-500 mb-1">
              Markierter Text
            </p>
            <p className="text-xs text-zinc-700 line-clamp-4 leading-relaxed">
              {pageData.selectedText}
            </p>
          </>
        ) : (
          <p className="text-xs text-zinc-500">Gesamte Seite wird analysiert</p>
        )}
      </div>

      {/* Meta summary */}
      {pageData.meta.authors.length > 0 && (
        <p className="text-xs text-zinc-500">
          <span className="font-medium">Autor:</span>{" "}
          {pageData.meta.authors.join(", ")}
        </p>
      )}

      {/* Generate button */}
      <button
        type="button"
        className="w-full rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800 active:bg-zinc-700 transition-colors cursor-pointer"
        onClick={onGenerate}
      >
        Generieren
      </button>
    </div>
  );
};

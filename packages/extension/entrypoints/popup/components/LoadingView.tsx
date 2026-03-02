import type { JSX } from "react";

export const LoadingView = (): JSX.Element => {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-8">
      {/* Simple CSS spinner */}
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900" />
      <p className="text-sm text-zinc-500">Generiere BibTeX-Eintrag&hellip;</p>
    </div>
  );
};

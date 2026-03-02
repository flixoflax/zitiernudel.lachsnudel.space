import { type JSX, useState } from "react";
import { IdleView } from "./components/IdleView.tsx";
import { LoadingView } from "./components/LoadingView.tsx";
import { ResultView } from "./components/ResultView.tsx";
import { SettingsView } from "./components/SettingsView.tsx";
import { useCitation } from "./hooks/useCitation.ts";
import { usePageData } from "./hooks/usePageData.ts";

type AppView = "main" | "settings";

export const App = (): JSX.Element => {
  const [view, setView] = useState<AppView>("main");
  const {
    data: pageData,
    loading: isPageLoading,
    error: pageError,
  } = usePageData();
  const {
    bibtex,
    loading: isCitationLoading,
    error: citationError,
    generate,
  } = useCitation();

  const handleGenerate = async () => {
    if (pageData) {
      await generate(pageData);
    }
  };

  const renderContent = () => {
    if (view === "settings") {
      return (
        <SettingsView
          onClose={() => {
            setView("main");
          }}
        />
      );
    }

    if (isPageLoading) {
      return (
        <div className="flex flex-col items-center justify-center gap-2 py-6">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900" />
          <p className="text-xs text-zinc-400">Seite wird analysiert&hellip;</p>
        </div>
      );
    }

    if (pageError) {
      return (
        <div className="rounded-md bg-red-50 border border-red-200 px-3 py-2">
          <p className="text-xs text-red-700">{pageError}</p>
        </div>
      );
    }

    if (isCitationLoading) {
      return <LoadingView />;
    }

    if (citationError) {
      return (
        <div className="flex flex-col gap-3">
          <div className="rounded-md bg-red-50 border border-red-200 px-3 py-2">
            <p className="text-xs text-red-700">{citationError}</p>
          </div>
          <button
            type="button"
            className="w-full rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800 active:bg-zinc-700 transition-colors cursor-pointer"
            onClick={handleGenerate}
          >
            Nochmal versuchen
          </button>
        </div>
      );
    }

    if (bibtex) {
      return <ResultView bibtex={bibtex} onRegenerate={handleGenerate} />;
    }

    if (pageData) {
      return <IdleView pageData={pageData} onGenerate={handleGenerate} />;
    }

    return null;
  };

  return (
    <div className="w-sm bg-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3">
        <h1 className="text-sm font-semibold text-zinc-900">ZitierNudel</h1>
        <button
          type="button"
          className="text-zinc-400 hover:text-zinc-600 transition-colors cursor-pointer"
          aria-label="Einstellungen"
          onClick={() => {
            setView(view === "settings" ? "main" : "settings");
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-4 w-4"
          >
            <path
              fillRule="evenodd"
              d="M7.84 1.804A1 1 0 0 1 8.82 1h2.36a1 1 0 0 1 .98.804l.331 1.652a6.993 6.993 0 0 1 1.929 1.115l1.598-.54a1 1 0 0 1 1.186.447l1.18 2.044a1 1 0 0 1-.205 1.251l-1.267 1.113a7.047 7.047 0 0 1 0 2.228l1.267 1.113a1 1 0 0 1 .206 1.25l-1.18 2.045a1 1 0 0 1-1.187.447l-1.598-.54a6.993 6.993 0 0 1-1.929 1.115l-.33 1.652a1 1 0 0 1-.98.804H8.82a1 1 0 0 1-.98-.804l-.331-1.652a6.993 6.993 0 0 1-1.929-1.115l-1.598.54a1 1 0 0 1-1.186-.447l-1.18-2.044a1 1 0 0 1 .205-1.251l1.267-1.114a7.05 7.05 0 0 1 0-2.227L1.821 7.773a1 1 0 0 1-.206-1.25l1.18-2.045a1 1 0 0 1 1.187-.447l1.598.54A6.992 6.992 0 0 1 7.51 3.456l.33-1.652ZM10 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="px-4 py-3">{renderContent()}</div>
    </div>
  );
};

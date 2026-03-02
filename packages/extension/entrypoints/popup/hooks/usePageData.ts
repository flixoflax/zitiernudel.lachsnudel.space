import { useEffect, useState } from "react";
import type { PageData } from "@/lib/types.ts";

interface UsePageDataResult {
  data: PageData | null;
  loading: boolean;
  error: string | null;
}

/**
 * On mount, injects the content script into the active tab and
 * retrieves the collected PageData.
 */
export const usePageData = (): UsePageDataResult => {
  const [data, setData] = useState<PageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    const collect = async () => {
      try {
        const [tab] = await browser.tabs.query({
          active: true,
          currentWindow: true,
        });

        if (!tab.id) {
          throw new Error("Kein aktiver Tab gefunden.");
        }

        // Inject the content script on demand via activeTab permission.
        // The content script's main() returns PageData directly.
        const results = await browser.scripting.executeScript({
          target: { tabId: tab.id },
          files: ["/content-scripts/content.js"],
        });

        const result = results[0]?.result as PageData | undefined;

        if (!result) {
          throw new Error("Keine Daten vom Content Script erhalten.");
        }

        if (!isCancelled) {
          setData(result);
        }
      } catch (error_) {
        console.error("[usePageData]", error_);
        if (!isCancelled) {
          const message =
            error_ instanceof Error ? error_.message : "Unbekannter Fehler";

          setError(message);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    // eslint-disable-next-line react-you-might-not-need-an-effect/no-initialize-state, @typescript-eslint/no-floating-promises
    collect();

    return () => {
      isCancelled = true;
    };
  }, []);

  return { data, loading: isLoading, error };
};

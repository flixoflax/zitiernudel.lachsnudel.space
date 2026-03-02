import { useCallback, useState } from "react";
import { getSettings } from "@/lib/storage.ts";
import type { BibTeXResponse, PageData } from "@/lib/types.ts";

interface UseCitationResult {
  response: BibTeXResponse | null;
  loading: boolean;
  error: string | null;
  generate: (pageData: PageData) => Promise<void>;
}

/**
 * Hook for generating a BibTeX citation from PageData.
 *
 * Calls the ZitierNudel API to generate a BibTeX entry using AI.
 */
export const useCitation = (): UseCitationResult => {
  const [response, setResponse] = useState<BibTeXResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(async (pageData: PageData) => {
    setIsLoading(true);
    setError(null);
    setResponse(null);

    try {
      const settings = await getSettings();

      // Build request headers
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (settings.apiKey) {
        headers["Authorization"] = `Bearer ${settings.apiKey}`;
      }

      console.info("[useCitation] POST request:", {
        url: `${settings.backendUrl}/api/cite`,
        headers,
      });

      // Call API
      const res = await fetch(`${settings.backendUrl}/api/cite`, {
        method: "POST",
        headers,
        body: JSON.stringify(pageData),
      });

      if (!res.ok) {
        const errorText = await res.text();

        throw new Error(
          `Backend-Fehler: ${res.status} ${res.statusText}${errorText ? ` - ${errorText}` : ""}`,
        );
      }

      // Parse response
      const data = (await res.json()) as BibTeXResponse;

      console.info("[useCitation] Response:", data);
      setResponse(data);
    } catch (error_) {
      console.error("[useCitation] Error:", error_);
      const message =
        error_ instanceof Error ? error_.message : "Unbekannter Fehler";

      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { response, loading: isLoading, error, generate };
};

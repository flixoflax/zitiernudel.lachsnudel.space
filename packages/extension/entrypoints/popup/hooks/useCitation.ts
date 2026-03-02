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
      let res: Response;

      // Check if this is a PDF submission
      if (pageData.isPDF && pageData.pdfData) {
        // PDF Flow: Multipart upload
        console.info("[useCitation] Preparing PDF multipart upload");

        const formData = new FormData();
        
        // Convert number array back to Uint8Array, then to Blob
        const pdfArray = new Uint8Array(pageData.pdfData);
        const pdfBlob = new Blob([pdfArray], { type: 'application/pdf' });

        formData.append('file', pdfBlob, 'document.pdf');
        
        // Add metadata as JSON string
        const metadata = {
          url: pageData.url,
          title: pageData.metadata?.title || pageData.title,
          author: pageData.metadata?.author,
          subject: pageData.metadata?.subject,
          creationDate: pageData.metadata?.creationDate,
          pageCount: pageData.metadata?.pageCount,
        };

        formData.append('metadata', JSON.stringify(metadata));

        // Build headers (no Content-Type - browser sets it with boundary)
        const headers: Record<string, string> = {};

        if (settings.apiKey) {
          headers.Authorization = `Bearer ${settings.apiKey}`;
        }

        console.info("[useCitation] POST PDF request:", {
          url: `${settings.backendUrl}/api/cite`,
          fileSize: pdfBlob.size,
          metadata,
        });

        res = await fetch(`${settings.backendUrl}/api/cite`, {
          method: "POST",
          headers,
          body: formData,
        });
      } else {
        // Web Page Flow: JSON (existing)
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };

        if (settings.apiKey) {
          headers.Authorization = `Bearer ${settings.apiKey}`;
        }

        console.info("[useCitation] POST JSON request:", {
          url: `${settings.backendUrl}/api/cite`,
          headers,
        });

        res = await fetch(`${settings.backendUrl}/api/cite`, {
          method: "POST",
          headers,
          body: JSON.stringify(pageData),
        });
      }

      if (!res.ok) {
        const errorText = await res.text();
        const errorSuffix = errorText ? ` - ${errorText}` : "";

        throw new Error(
          `Backend-Fehler: ${res.status} ${res.statusText}${errorSuffix}`,
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

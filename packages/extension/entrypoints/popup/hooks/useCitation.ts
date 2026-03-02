import { useCallback, useState } from "react";
import { getSettings } from "@/lib/storage.ts";
import type { PageData } from "@/lib/types.ts";

interface UseCitationResult {
  bibtex: string | null;
  loading: boolean;
  error: string | null;
  generate: (pageData: PageData) => Promise<void>;
}

/** Format today's date as DD.MM.YYYY for the mock. */
const formatDate = (): string => {
  const d = new Date();
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();

  return `${day}.${month}.${year}`;
};

/** Create a BibTeX key from author and title. */
const makeBibtexKey = (author: string, title: string): string => {
  const surname = author.split(/\s+/).pop() ?? "unknown";
  const year = new Date().getFullYear();
  const slug = title
    .split(/\s+/)
    .slice(0, 2)
    .join("")
    .replaceAll(/[^a-z0-9]/gi, "")
    .toLowerCase();

  return `${surname.toLowerCase()}${year}${slug}`;
};

/**
 * Hook for generating a BibTeX citation from PageData.
 *
 * Currently mocked — logs the payload and returns a fake BibTeX entry.
 * When the backend is ready, swap the mock with a real fetch call.
 */
export const useCitation = (): UseCitationResult => {
  const [bibtex, setBibtex] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(async (pageData: PageData) => {
    setIsLoading(true);
    setError(null);
    setBibtex(null);

    try {
      const settings = await getSettings();

      // ── Mock mode ─────────────────────────────────────────────
      // Log the full payload for debugging, then return a fake entry.
      console.info("[useCitation] POST payload:", {
        url: `${settings.backendUrl}/api/cite`,
        body: pageData,
      });

      // Simulate network latency
      await new Promise((resolve) => {
        setTimeout(resolve, 1500);
      });

      const author = pageData.meta.authors[0] ?? "Unbekannter Autor";
      const title = pageData.title || "Ohne Titel";
      const key = makeBibtexKey(author, title);

      const mockBibtex = [
        `@misc{${key},`,
        `  author    = {${author}},`,
        `  title     = {${title}},`,
        `  url       = {${pageData.url}},`,
        `  note      = {Zuletzt besucht am ${formatDate()}},`,
        `}`,
      ].join("\n");

      setBibtex(mockBibtex);
      // ── End mock ──────────────────────────────────────────────

      // ── Real implementation (uncomment when backend is ready) ─
      // const headers: Record<string, string> = {
      //   "Content-Type": "application/json",
      // };
      // if (settings.apiKey) {
      //   headers["Authorization"] = `Bearer ${settings.apiKey}`;
      // }
      //
      // const res = await fetch(`${settings.backendUrl}/api/cite`, {
      //   method: "POST",
      //   headers,
      //   body: JSON.stringify(pageData),
      // });
      //
      // if (!res.ok) {
      //   throw new Error(`Backend-Fehler: ${res.status} ${res.statusText}`);
      // }
      //
      // const data = await res.json();
      // setBibtex(data.bibtex);
      // ──────────────────────────────────────────────────────────
    } catch (error_) {
      console.error("[useCitation]", error_);
      const message =
        error_ instanceof Error ? error_.message : "Unbekannter Fehler";

      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { bibtex, loading: isLoading, error, generate };
};

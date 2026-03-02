import type { PageMeta } from "@/lib/types.ts";

/** Get content of a <meta name="..."> tag. */
const getMetaContent = (name: string): string | null => {
  const el = document.querySelector(`meta[name="${name}" i]`);

  return (el as HTMLMetaElement | null)?.content.trim() || null;
};

/** Get content of a <meta property="..."> tag (OpenGraph style). */
const getMetaProperty = (property: string): string | null => {
  const el = document.querySelector(`meta[property="${property}" i]`);

  return (el as HTMLMetaElement | null)?.content.trim() || null;
};

/** Gather author names from multiple possible sources. */
const extractAuthors = (): string[] => {
  const authors = new Set<string>();

  // Standard meta author tag
  const authorContent = getMetaContent("author");

  if (authorContent) {
    for (const name of authorContent.split(/[,;]/)) {
      const trimmed = name.trim();

      if (trimmed) {
        authors.add(trimmed);
      }
    }
  }

  // citation_author (can appear multiple times)
  const citationAuthors = document.querySelectorAll(
    'meta[name="citation_author"]',
  );

  for (const el of citationAuthors) {
    const content = (el as HTMLMetaElement).content.trim();

    if (content) {
      authors.add(content);
    }
  }

  // og:article:author
  const ogAuthor = getMetaProperty("article:author");

  if (ogAuthor) {
    authors.add(ogAuthor);
  }

  // Schema.org ld+json authors are handled separately in ldJson parsing
  return [...authors];
};

/** Extract all meta[property] tags that start with a given prefix. */
const extractPrefixedProperties = (prefix: string): Record<string, string> => {
  const result: Record<string, string> = {};
  const metas = document.querySelectorAll(`meta[property^="${prefix}" i]`);

  for (const el of metas) {
    const meta = el as HTMLMetaElement;
    const key = meta.getAttribute("property");
    const value = meta.content.trim();

    if (key && value) {
      result[key] = value;
    }
  }

  return result;
};

/** Extract all citation_* meta tags. */
const extractCitationTags = (): Record<string, string> => {
  const result: Record<string, string> = {};
  const metas = document.querySelectorAll('meta[name^="citation_" i]');

  for (const el of metas) {
    const meta = el as HTMLMetaElement;
    const key = meta.getAttribute("name");
    const value = meta.content.trim();

    if (key && value) {
      // For multi-value tags like citation_author, join with semicolons
      if (result[key]) {
        result[key] = `${result[key]}; ${value}`;
      } else {
        result[key] = value;
      }
    }
  }

  return result;
};

/** Parse all <script type="application/ld+json"> blocks. */
const extractLdJson = (): unknown[] => {
  const scripts = document.querySelectorAll(
    'script[type="application/ld+json"]',
  );
  const results: unknown[] = [];

  for (const script of scripts) {
    try {
      const data: unknown = JSON.parse(script.textContent);

      results.push(data);
    } catch {
      // Silently skip malformed JSON-LD blocks
    }
  }

  return results;
};

/** Extract all relevant metadata from the current page's <head>. */
export const extractMeta = (): PageMeta => {
  const authors = extractAuthors();
  const description = getMetaContent("description");
  const siteName =
    getMetaProperty("og:site_name") ??
    getMetaContent("application-name") ??
    null;
  const publishedDate =
    getMetaProperty("article:published_time") ??
    getMetaContent("citation_publication_date") ??
    getMetaContent("date") ??
    null;
  const modifiedDate =
    getMetaProperty("article:modified_time") ??
    getMetaContent("last-modified") ??
    null;
  const ogTags = extractPrefixedProperties("og:");
  const articleTags = extractPrefixedProperties("article:");
  const citationTags = extractCitationTags();
  const ldJson = extractLdJson();

  return {
    authors,
    description,
    siteName,
    publishedDate,
    modifiedDate,
    ogTags: { ...ogTags, ...articleTags },
    citationTags,
    ldJson,
  };
};

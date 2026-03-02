/** Metadata extracted from the page's <head> element. */
export interface PageMeta {
  authors: string[];
  description: string | null;
  siteName: string | null;
  publishedDate: string | null;
  modifiedDate: string | null;
  /** All og:* and article:* meta properties. */
  ogTags: Record<string, string>;
  /** All citation_* meta tags (Google Scholar / legal DB schema). */
  citationTags: Record<string, string>;
  /** Parsed <script type="application/ld+json"> blocks. */
  ldJson: unknown[];
}

/** Data collected from the active tab by the content script. */
export interface PageData {
  url: string;
  title: string;
  /** Text the user had selected, or null if nothing was selected. */
  selectedText: string | null;
  meta: PageMeta;
  /** Cleaned page content converted to Markdown (~4000 chars max). */
  markdown: string;
}

/** User-configurable extension settings. */
export interface Settings {
  backendUrl: string;
  apiKey: string;
}

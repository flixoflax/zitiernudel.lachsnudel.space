import type { z } from "zod";
import {
  bibTeXEntryTypeSchema,
  bibTeXResponseSchema,
  confidenceSchema,
  pageDataSchema,
  pageMetaSchema,
  settingsSchema,
} from "./schemas";

// ============================================================================
// Re-export Zod schemas for validation
// ============================================================================

export {
  bibTeXEntryTypeSchema,
  bibTeXResponseSchema,
  confidenceSchema,
  pageDataSchema,
  pageMetaSchema,
  settingsSchema,
};

// ============================================================================
// TypeScript types inferred from Zod schemas
// ============================================================================

/** Metadata extracted from the page's head element. */
export type PageMeta = z.infer<typeof pageMetaSchema>;

/** Data collected from the active tab by the content script. */
export type PageData = z.infer<typeof pageDataSchema>;

/** BibTeX entry type (e.g., \@book, \@article). */
export type BibTeXEntryType = z.infer<typeof bibTeXEntryTypeSchema>;

/** Confidence level for generated BibTeX entries. */
export type Confidence = z.infer<typeof confidenceSchema>;

/** API response containing the generated BibTeX entry. */
export type BibTeXResponse = z.infer<typeof bibTeXResponseSchema>;

/** User-configurable extension settings. */
export type Settings = z.infer<typeof settingsSchema>;

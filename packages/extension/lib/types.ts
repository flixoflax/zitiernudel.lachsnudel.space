/**
 * Re-export types from the core package.
 * The core package provides shared types and Zod schemas
 * used by both the extension and the API.
 */
export type {
  BibTeXEntryType,
  BibTeXResponse,
  Confidence,
  PageData,
  PageMeta,
  Settings,
} from "@zitiernudel/core/types";

// Re-export schemas for runtime validation if needed
export {
  bibTeXEntryTypeSchema,
  bibTeXResponseSchema,
  confidenceSchema,
  pageDataSchema,
  pageMetaSchema,
  settingsSchema,
} from "@zitiernudel/core/types";

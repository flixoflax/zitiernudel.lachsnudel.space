import { z } from "zod";

// ============================================================================
// Input Schemas (Extension → API)
// ============================================================================

/**
 * Schema for metadata extracted from the page's `<head>` element.
 * Includes OpenGraph tags, citation metadata, and structured data.
 */
export const pageMetaSchema = z.object({
  /** List of author names extracted from meta tags. */
  authors: z.array(z.string()),

  /** Meta description or og:description. */
  description: z.string().nullable(),

  /** Site name from og:site_name or similar. */
  siteName: z.string().nullable(),

  /** Publication date (og:article:published_time, etc.). */
  publishedDate: z.string().nullable(),

  /** Last modified date (og:article:modified_time, etc.). */
  modifiedDate: z.string().nullable(),

  /** All og:* and article:* meta properties as key-value pairs. */
  ogTags: z.record(z.string(), z.string()),

  /** All citation_* meta tags (Google Scholar / legal DB schema). */
  citationTags: z.record(z.string(), z.string()),

  /** Parsed script type="application/ld+json" blocks. */
  ldJson: z.array(z.unknown()),
});

/**
 * Schema for PDF-specific metadata extracted from the PDF file.
 */
export const pdfMetadataSchema = z.object({
  /** Title extracted from PDF metadata. */
  title: z.string().nullable().optional(),

  /** Author extracted from PDF metadata. */
  author: z.string().nullable().optional(),

  /** Subject/keywords from PDF metadata. */
  subject: z.string().nullable().optional(),

  /** Creation date from PDF metadata. */
  creationDate: z.string().nullable().optional(),

  /** Number of pages in the PDF. */
  pageCount: z.number().nullable().optional(),
});

/**
 * Schema for complete page data collected by the extension.
 * This is the payload sent to the API for BibTeX generation.
 * 
 * Supports both regular web pages and PDF files.
 */
export const pageDataSchema = z.object({
  /** Full URL of the page or PDF. */
  url: z.string(),

  /** Page/document title from <title>, og:title, or PDF metadata. */
  title: z.string().optional(),

  /** Text the user had selected, or null if nothing was selected. */
  selectedText: z.string().nullable().optional(),

  /** Extracted metadata from page head (web pages only). */
  meta: pageMetaSchema.optional(),

  /** Cleaned page content converted to Markdown (~4000 chars max, web pages only). */
  markdown: z.string().optional(),

  /** Flag indicating this is a PDF file. */
  isPDF: z.boolean().optional(),

  /** PDF binary data as number array (for JSON serialization). */
  pdfData: z.array(z.number()).optional(),

  /** PDF-specific metadata extracted from the file. */
  metadata: pdfMetadataSchema.optional(),

  /** Internal error message if processing failed. */
  _error: z.string().optional(),
});

// ============================================================================
// Output Schemas (API → Extension)
// ============================================================================

/**
 * BibTeX entry types supported by ZitierNudel.
 * Based on the hu-jura citation format.
 */
export const bibTeXEntryTypeSchema = z.enum([
  "@book", // Monographien, Lehrbücher, Kommentare
  "@article", // Zeitschriftenaufsätze
  "@incollection", // Festschriften, Sammelbände
  "@online", // Internetquellen
  "@thesis", // Dissertationen
  "@jurisdiction", // Gerichtsentscheidungen (custom type)
  "@misc", // Fallback für unklare Quellen
]);

/**
 * Confidence level for the generated BibTeX entry.
 * Indicates how certain the AI is about the extracted data.
 */
export const confidenceSchema = z.enum(["low", "medium", "high"]);

/**
 * Schema for the API response containing the generated BibTeX entry.
 * The API uses Vercel AI SDK to generate structured output.
 */
export const bibTeXResponseSchema = z.object({
  /**
   * The complete BibTeX entry, ready to copy into a .bib file.
   * Must be valid BibTeX syntax with proper formatting.
   */
  bibtex: z
    .string()
    .describe(
      "Complete BibTeX entry ready to copy into .bib file with proper formatting and escaping",
    ),

  /**
   * The citation key in format: author:keyword (e.g., maurer:verwaltungsrecht).
   * Must be lowercase, no umlauts, no special characters.
   */
  citeKey: z
    .string()
    .describe(
      "Citation key in format author:keyword (e.g., maurer:verwaltungsrecht). Lowercase, no umlauts.",
    ),

  /**
   * The BibTeX entry type matching the source material.
   * Choose the most appropriate type based on the source.
   */
  entryType: bibTeXEntryTypeSchema.describe(
    "BibTeX entry type that best matches the source material (@book for monographs, @article for journal articles, @online for web sources, etc.)",
  ),

  /**
   * Confidence in data quality based on available information.
   * - "high": All required fields found with high certainty
   * - "medium": Most fields found, some inferred from context
   * - "low": Significant data missing or highly uncertain
   */
  confidence: confidenceSchema.describe(
    "Confidence in data quality: high (all fields found), medium (some inferred), low (significant gaps or uncertainty)",
  ),

  /**
   * LaTeX footnote citation example with proper formatting.
   * Shows user how to cite this source in their document.
   * e.g., "\\footcite[S.~42]{maurer:verwaltungsrecht}"
   */
  footnoteExample: z
    .string()
    .describe(
      "LaTeX footnote citation example with proper formatting, e.g., \\footcite[S.~42]{key} or \\footcite[615]{key}",
    ),

  /**
   * List of warnings about missing or uncertain data.
   * Empty array if no issues detected.
   * e.g., ["Keine Auflage gefunden", "Autor aus URL geraten"]
   */
  warnings: z
    .array(z.string())
    .describe(
      "List of warnings about missing or uncertain data. Empty array if no issues. Be specific about what is missing or uncertain.",
    ),
});

// ============================================================================
// Extension Settings Schema
// ============================================================================

/**
 * Schema for user-configurable extension settings.
 */
export const settingsSchema = z.object({
  /** URL of the ZitierNudel API backend. */
  backendUrl: z.string(),

  /** Optional API key for authenticated requests. */
  apiKey: z.string(),
});

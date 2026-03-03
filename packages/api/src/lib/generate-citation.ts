import { generateText, Output } from "ai";
import { openai } from "@ai-sdk/openai";
import { SYSTEM_PROMPT } from "../prompt";
import {
  type BibTeXResponse,
  bibTeXResponseSchema,
  type PageData,
} from "./types";

/**
 * Generate a fallback citation key from page data.
 */
const generateFallbackKey = (pageData: PageData): string => {
  const author =
    pageData.meta?.authors[0] ?? pageData.meta?.siteName ?? "unknown";
  const year = new Date().getFullYear();

  // Extract surname or site name
  const surname = author.split(/\s+/).pop() || "unknown";

  // Create slug from title
  const slug = (pageData.title ?? "untitled")
    .split(/\s+/)
    .slice(0, 2)
    .join("")
    .replaceAll(/[^a-z0-9]/gi, "")
    .toLowerCase();

  return `${surname.toLowerCase()}${String(year)}${slug}`;
};

/**
 * Generate a fallback BibTeX entry when AI generation fails.
 */
const generateFallbackBibTeX = (pageData: PageData): string => {
  const key = generateFallbackKey(pageData);
  const author =
    pageData.meta?.authors[0] ?? pageData.meta?.siteName ?? "Unbekannt";
  const title = pageData.title ?? "Ohne Titel";
  const today = new Date().toISOString().split("T")[0];

  return [
    `@online{${key},`,
    `  author  = {${author}},`,
    `  title   = {${title}},`,
    `  url     = {${pageData.url}},`,
    `  urldate = {${today}},`,
    `}`,
  ].join("\n");
};

/**
 * Build the user message containing page data for the AI.
 */
const buildUserMessage = (pageData: PageData): string => {
  const initialParts = [`# Webseiten-Daten\n`];
  const parts = [
    ...initialParts,
    `URL: ${pageData.url}\n`,
    `Titel: ${pageData.title ?? "Unbekannt"}\n`,
  ];

  // Add metadata
  if (pageData.meta && pageData.meta.authors.length > 0) {
    parts.push(`\nAutoren: ${pageData.meta.authors.join(", ")}`);
  }

  if (pageData.meta?.description) {
    parts.push(`\nBeschreibung: ${pageData.meta.description}`);
  }

  if (pageData.meta?.siteName) {
    parts.push(`\nWebsite: ${pageData.meta.siteName}`);
  }

  if (pageData.meta?.publishedDate) {
    parts.push(`\nVeröffentlicht: ${pageData.meta.publishedDate}`);
  }

  // Add OpenGraph tags if present
  if (pageData.meta && Object.keys(pageData.meta.ogTags).length > 0) {
    parts.push(`\n## OpenGraph Meta-Tags:`);
    for (const [key, value] of Object.entries(pageData.meta.ogTags)) {
      parts.push(`- ${key}: ${value}`);
    }
  }

  // Add citation tags (important for academic/legal sources)
  if (pageData.meta && Object.keys(pageData.meta.citationTags).length > 0) {
    parts.push(`\n## Citation Meta-Tags:`);
    for (const [key, value] of Object.entries(pageData.meta.citationTags)) {
      parts.push(`- ${key}: ${value}`);
    }
  }

  // Add JSON-LD structured data
  if (pageData.meta && pageData.meta.ldJson.length > 0) {
    parts.push(`\n## Strukturierte Daten (JSON-LD):`);
    parts.push("```json");
    parts.push(JSON.stringify(pageData.meta.ldJson, null, 2));
    parts.push("```");
  }

  // Add selected text if present
  if (pageData.selectedText) {
    parts.push(`\n## Ausgewählter Text:`);
    parts.push(pageData.selectedText);
  }

  // Add page content (markdown)
  if (pageData.markdown) {
    parts.push(`\n## Seiteninhalt (Markdown):`);
    parts.push(pageData.markdown);
  }

  return parts.join("\n");
};

/**
 * Generate a BibTeX citation from page data using OpenAI.
 *
 * Uses structured output with the Vercel AI SDK to ensure
 * the response matches our BibTeXResponse schema.
 */
export const generateCitation = async (
  pageData: PageData,
): Promise<BibTeXResponse> => {
  const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "OPENAI_API_KEY is not set in environment variables. Please add it to .env file.",
    );
  }

  try {
    // Prepare user message with page data
    const userMessage = buildUserMessage(pageData);

    // Generate structured output using generateText with Output.object
    const { output } = await generateText({
      model: openai(model),
      output: Output.object({
        name: "BibTeXEntry",
        description:
          "A BibTeX citation entry in hu-jura format for German legal citations",
        schema: bibTeXResponseSchema,
      }),
      system: SYSTEM_PROMPT,
      prompt: userMessage,
      temperature: 0.3, // Lower temperature for more consistent output
    });

    return output;
  } catch (error) {
    console.error("[generateCitation] Error:", error);

    // Return fallback response with low confidence on error
    const fallbackKey = generateFallbackKey(pageData);

    return {
      bibtex: generateFallbackBibTeX(pageData),
      citeKey: fallbackKey,
      entryType: "@online",
      confidence: "low",
      footnoteExample: `\\footcite{${fallbackKey}}`,
      warnings: [
        "Fehler bei der AI-Generierung",
        "Fallback-Eintrag erstellt",
        error instanceof Error ? error.message : "Unbekannter Fehler",
      ],
    };
  }
};

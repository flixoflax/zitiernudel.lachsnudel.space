import { generateText, Output } from "ai";
import { openai } from "@ai-sdk/openai";
import {
  type BibTeXResponse,
  bibTeXResponseSchema,
} from "@zitiernudel/core/types";
import { SYSTEM_PROMPT } from "../prompt";

interface PDFMetadata {
  url: string;
  title?: string | null;
  author?: string | null;
  subject?: string | null;
  creationDate?: string | null;
  pageCount?: number | null;
}

/**
 * Generate a fallback citation key from PDF metadata.
 */
const generateFallbackKey = (metadata: PDFMetadata): string => {
  const author = metadata.author || "unknown";
  const year = new Date().getFullYear();

  const surname = author.split(/\s+/).pop() || "unknown";
  const slug = (metadata.title || "document")
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
const generateFallbackBibTeX = (metadata: PDFMetadata): string => {
  const key = generateFallbackKey(metadata);
  const author = metadata.author || "Unbekannt";
  const title = metadata.title || "Ohne Titel";
  const today = new Date().toISOString().split("T")[0];

  return [
    `@online{${key},`,
    `  author  = {${author}},`,
    `  title   = {${title}},`,
    `  url     = {${metadata.url}},`,
    `  urldate = {${today}},`,
    `}`,
  ].join("\n");
};

/**
 * Build the user message for PDF citation generation.
 */
const buildUserMessage = (metadata: PDFMetadata): string => {
  const parts = [`# PDF-Dokument Analyse\n`, `URL: ${metadata.url}\n`];

  if (metadata.title) {
    parts.push(`Extrahierter Titel aus PDF-Metadaten: ${metadata.title}\n`);
  }

  if (metadata.author) {
    parts.push(`Extrahierter Autor aus PDF-Metadaten: ${metadata.author}\n`);
  }

  if (metadata.subject) {
    parts.push(`Betreff/Schlüsselwörter: ${metadata.subject}\n`);
  }

  if (metadata.creationDate) {
    parts.push(`Erstellungsdatum: ${metadata.creationDate}\n`);
  }

  if (metadata.pageCount !== null && metadata.pageCount !== undefined) {
    parts.push(`Seitenanzahl: ${String(metadata.pageCount)}\n`);
  }

  parts.push(
    `\n## Aufgabe\n` +
      `Bitte lesen und analysieren Sie das beigefügte PDF-Dokument sorgfältig.\n` +
      `Erstellen Sie einen präzisen BibTeX-Eintrag nach den HU-Jura-Richtlinien.\n\n` +
      `**WICHTIG:**\n` +
      `1. Identifizieren Sie den korrekten Entry-Typ (@book, @article, @thesis, @jurisdiction, @incollection, @online)\n` +
      `2. Extrahieren Sie ALLE bibliographischen Daten aus dem PDF-Inhalt (nicht nur aus Metadaten!)\n` +
      `3. Achten Sie auf:\n` +
      `   - Vollständige Autorennamen (achten Sie auf Namenspräfixe wie "von", "van", etc.)\n` +
      `   - Genaue Titel und ggf. Untertitel\n` +
      `   - Edition/Auflage (nur wenn nicht 1. Auflage)\n` +
      `   - Verlagsort und Erscheinungsjahr\n` +
      `   - Bei Zeitschriftenartikeln: Zeitschrift, Band, Seitenzahlen\n` +
      `   - Bei Gerichtsentscheidungen: Gericht, Datum, Aktenzeichen, Fundstelle\n` +
      `   - Bei Dissertationen: "Jur. Diss.", Universität\n` +
      `4. Formatieren Sie EXAKT nach den Vorgaben (Doppelklammern für Präfixe, ISO-Datumsformat, etc.)\n` +
      `5. Setzen Sie confidence basierend auf der Vollständigkeit und Sicherheit der Daten\n`,
  );

  return parts.join("\n");
};

/**
 * Generate a BibTeX citation from a PDF file using AI.
 *
 * Uses the AI SDK's file attachment feature to send the PDF
 * directly to the model for analysis.
 */
export const generateCitationFromPDF = async (
  pdfBuffer: Buffer,
  metadata: PDFMetadata,
): Promise<BibTeXResponse> => {
  const model = process.env.OPENAI_MODEL ?? "gpt-4o";
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "OPENAI_API_KEY is not set in environment variables. Please add it to .env file.",
    );
  }

  // Warn if model might not support file uploads
  if (
    !model.includes("gpt-4o") &&
    !model.includes("gpt-5") &&
    !model.includes("claude")
  ) {
    console.warn(
      `[generateCitationFromPDF] Model '${model}' may not support file uploads. Attempting anyway...`,
    );
  }

  try {
    const userMessage = buildUserMessage(metadata);

    console.info(
      "[generateCitationFromPDF] Generating citation with PDF file attachment",
    );
    console.info(
      "[generateCitationFromPDF] PDF size:",
      pdfBuffer.length,
      "bytes",
    );
    console.info("[generateCitationFromPDF] Metadata:", metadata);
    console.info("[generateCitationFromPDF] Model:", model);

    // Generate structured output with file attachment
    const { output } = await generateText({
      model: openai(model),
      output: Output.object({
        name: "BibTeXEntry",
        description:
          "A BibTeX citation entry in hu-jura format for German legal citations, generated from a PDF document",
        schema: bibTeXResponseSchema,
      }),
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: userMessage,
            },
            {
              type: "file",
              data: pdfBuffer,
              mediaType: "application/pdf",
            },
          ],
        },
      ],
      temperature: 0.3, // Lower temperature for more consistent output
    });

    console.info("[generateCitationFromPDF] Successfully generated citation:", {
      citeKey: output.citeKey,
      entryType: output.entryType,
      confidence: output.confidence,
    });

    return output;
  } catch (error) {
    console.error("[generateCitationFromPDF] Error:", error);

    // Return fallback response with low confidence on error
    const fallbackKey = generateFallbackKey(metadata);

    return {
      bibtex: generateFallbackBibTeX(metadata),
      citeKey: fallbackKey,
      entryType: "@online",
      confidence: "low",
      footnoteExample: `\\footcite{${fallbackKey}}`,
      warnings: [
        "Fehler bei der AI-Generierung",
        "Fallback-Eintrag erstellt (nur basierend auf PDF-Metadaten)",
        error instanceof Error ? error.message : "Unbekannter Fehler",
        "Bitte überprüfen Sie den Eintrag manuell und ergänzen Sie fehlende Informationen",
      ],
    };
  }
};

import { Hono } from "hono";
import { generateCitation } from "../lib/generate-citation";
import { generateCitationFromPDF } from "../lib/generate-citation-pdf";
import { pageDataSchema } from "../lib/types";

/**
 * Citation generation routes.
 *
 * POST /api/cite - Generate BibTeX citation from page data or PDF file.
 */
export const citeRoutes = new Hono();

/**
 * POST /api/cite endpoint.
 *
 * Accepts two formats:
 * 1. JSON (web pages): PageData object
 * 2. Multipart (PDFs): PDF file + metadata JSON.
 *
 * Response: BibTeXResponse.
 *
 * Generates a BibTeX citation entry from webpage data or PDF using AI.
 */
citeRoutes.post("/", async (c) => {
  try {
    const contentType = c.req.header("content-type") || "";

    // Check if this is a multipart upload (PDF)
    if (contentType.includes("multipart/form-data")) {
      console.info("[POST /api/cite] Processing PDF multipart upload");

      const formData = await c.req.formData();
      const file = formData.get("file");
      const metadataStr = formData.get("metadata");

      // Validate inputs
      if (!file || !(file instanceof File)) {
        return c.json({ error: "No PDF file provided" }, 400);
      }

      if (!metadataStr || typeof metadataStr !== "string") {
        return c.json({ error: "No metadata provided" }, 400);
      }

      // Parse metadata
      let metadata: unknown;

      try {
        metadata = JSON.parse(metadataStr) as unknown;
      } catch {
        return c.json({ error: "Invalid metadata JSON" }, 400);
      }

      /**
       * Maximum file size: 50MB.
       */
      const MAX_SIZE = 50 * 1024 * 1024;
      const maxSizeMB = String(MAX_SIZE / 1024 / 1024);
      const fileSizeMB = (file.size / 1024 / 1024).toFixed(2);

      if (file.size > MAX_SIZE) {
        return c.json(
          {
            error: "PDF too large",
            message: `Maximum file size is ${maxSizeMB}MB. Your file is ${fileSizeMB}MB.`,
          },
          400,
        );
      }

      // Verify it's a PDF
      if (file.type && !file.type.includes("pdf")) {
        return c.json(
          {
            error: "Invalid file type",
            message: `Only PDF files are supported. Received: ${file.type}`,
          },
          400,
        );
      }

      // Convert File to Buffer
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      console.info("[POST /api/cite] PDF file received:", {
        name: file.name,
        size: file.size,
        type: file.type,
        metadata,
      });

      // Generate citation from PDF
      const pdfResponse = await generateCitationFromPDF(
        buffer,
        metadata as {
          url: string;
          title?: string | null;
          author?: string | null;
          subject?: string | null;
          creationDate?: string | null;
          pageCount?: number | null;
        },
      );

      return c.json(pdfResponse);
    }
    // JSON flow for web pages (existing)
    console.info("[POST /api/cite] Processing web page JSON data");

    const body = await c.req.json();

    // Validate with Zod schema
    const parseResult = pageDataSchema.safeParse(body);

    if (!parseResult.success) {
      return c.json(
        {
          error: "Invalid request data",
          details: parseResult.error.issues,
        },
        400,
      );
    }

    const pageData = parseResult.data;

    // Generate citation using AI
    const response = await generateCitation(pageData);

    return c.json(response);
  } catch (error) {
    console.error("[POST /api/cite] Error:", error);

    // Handle specific error cases
    if (error instanceof Error) {
      if (
        error.message.includes("API_KEY") ||
        error.message.includes("API key")
      ) {
        return c.json(
          {
            error: "Server configuration error",
            message: "AI API key not configured",
          },
          500,
        );
      }

      return c.json(
        {
          error: "Internal server error",
          message: error.message,
        },
        500,
      );
    }

    return c.json(
      {
        error: "Internal server error",
        message: "An unknown error occurred",
      },
      500,
    );
  }
});

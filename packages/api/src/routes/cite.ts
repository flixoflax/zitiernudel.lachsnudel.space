import { Hono } from "hono";
import { pageDataSchema } from "@zitiernudel/core/types";
import { generateCitation } from "../lib/generate-citation";

/**
 * Citation generation routes.
 *
 * POST /api/cite - Generate BibTeX citation from page data.
 */
export const citeRoutes = new Hono();

/**
 * POST /api/cite endpoint.
 *
 * Request body: PageData (validated with Zod schema).
 * Response: BibTeXResponse.
 *
 * Generates a BibTeX citation entry from webpage data using AI.
 */
citeRoutes.post("/", async (c) => {
  try {
    // Parse request body
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

    // Return response (already matches BibTeXResponse schema)
    return c.json(response);
  } catch (error) {
    console.error("[POST /api/cite] Error:", error);

    // Handle specific error cases
    if (error instanceof Error) {
      if (error.message.includes("OPENAI_API_KEY")) {
        return c.json(
          {
            error: "Server configuration error",
            message: "OpenAI API key not configured",
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

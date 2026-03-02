# @zitiernudel/core

Shared types and Zod schemas for ZitierNudel packages.

## Overview

This package provides type-safe schemas and TypeScript types used across the ZitierNudel ecosystem:
- **Extension** (`@zitiernudel/extension`) - Browser extension for scraping page data
- **API** (`@zitiernudel/api`) - Backend service for generating BibTeX entries

## Installation

This package is part of the ZitierNudel monorepo and is installed automatically via workspace dependencies.

## Usage

### Importing Types

```typescript
import type { PageData, BibTeXResponse } from "@zitiernudel/core/types";
```

### Importing Schemas for Validation

```typescript
import { pageDataSchema, bibTeXResponseSchema } from "@zitiernudel/core/types";

// Validate incoming data
const result = pageDataSchema.safeParse(data);
if (result.success) {
  console.log(result.data);
}
```

## Available Types

### Input Types (Extension → API)

- **`PageMeta`** - Metadata extracted from page `<head>` (authors, dates, OpenGraph tags, etc.)
- **`PageData`** - Complete page data sent to API (URL, title, meta, markdown content)
- **`Settings`** - User-configurable extension settings

### Output Types (API → Extension)

- **`BibTeXResponse`** - API response containing generated BibTeX entry
- **`BibTeXEntryType`** - Entry type enum (`@book`, `@article`, etc.)
- **`Confidence`** - Confidence level (`low`, `medium`, `high`)

## Schemas

All types are inferred from Zod schemas, enabling runtime validation:

- `pageMetaSchema`
- `pageDataSchema`
- `settingsSchema`
- `bibTeXResponseSchema`
- `bibTeXEntryTypeSchema`
- `confidenceSchema`

## Example: API Endpoint

```typescript
import { Hono } from "hono";
import type { PageData, BibTeXResponse } from "@zitiernudel/core/types";
import { pageDataSchema, bibTeXResponseSchema } from "@zitiernudel/core/types";

const app = new Hono();

app.post("/api/cite", async (c) => {
  // Parse and validate request body
  const body = await c.req.json();
  const parseResult = pageDataSchema.safeParse(body);
  
  if (!parseResult.success) {
    return c.json({ error: "Invalid request data" }, 400);
  }
  
  const pageData: PageData = parseResult.data;
  
  // Generate BibTeX entry using AI...
  const response: BibTeXResponse = {
    bibtex: "@book{...}",
    citeKey: "maurer:verwaltungsrecht",
    entryType: "@book",
    confidence: "high",
    footnoteExample: "\\\\footcite[S.~42]{maurer:verwaltungsrecht}",
  };
  
  // Validate response before sending
  return c.json(bibTeXResponseSchema.parse(response));
});
```

## Example: Extension Usage

```typescript
import type { PageData, BibTeXResponse } from "@zitiernudel/core/types";

const generateCitation = async (pageData: PageData): Promise<BibTeXResponse> => {
  const response = await fetch("https://api.zitiernudel.de/cite", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(pageData),
  });
  
  return response.json();
};
```

## BibTeX Response Structure

```typescript
{
  bibtex: string;              // Complete BibTeX entry ready to copy
  citeKey: string;             // Citation key (e.g., "maurer:verwaltungsrecht")
  entryType: BibTeXEntryType;  // Entry type (e.g., "@book")
  confidence: Confidence;      // "low" | "medium" | "high"
  footnoteExample: string;     // LaTeX citation example
  warnings?: string[];         // Optional data quality warnings
}
```

## Development

Run type checking:

```bash
bun run check
```

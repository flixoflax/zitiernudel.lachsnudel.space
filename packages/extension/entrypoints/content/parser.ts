// eslint-disable-next-line @typescript-eslint/naming-convention
import TurndownService from "turndown";

const MAX_MARKDOWN_LENGTH = 4000;

/** Selectors and patterns for noise elements to remove. */
const NOISE_SELECTORS = [
  // Structural noise
  "nav",
  "footer",
  "header",
  "aside",
  "script",
  "style",
  "noscript",
  "iframe",
  "svg",
  // ARIA roles
  '[role="navigation"]',
  '[role="banner"]',
  '[role="contentinfo"]',
  '[role="complementary"]',
  '[role="search"]',
  '[aria-hidden="true"]',
  // Common ad / cookie / sidebar patterns
  '[class*="cookie"]',
  '[class*="Cookie"]',
  '[class*="consent"]',
  '[class*="Consent"]',
  '[class*="banner"]',
  '[class*="sidebar"]',
  '[class*="Sidebar"]',
  '[class*="advert"]',
  '[class*="social"]',
  '[class*="share"]',
  '[class*="Share"]',
  '[class*="newsletter"]',
  '[class*="popup"]',
  '[class*="modal"]',
  '[class*="overlay"]',
  '[id*="cookie"]',
  '[id*="consent"]',
  '[id*="sidebar"]',
  '[id*="advert"]',
  '[id*="ad-"]',
].join(", ");

/** Find the best content container in the document. */
const findContentRoot = (): Element => {
  const candidates: Element | null =
    document.querySelector("article") ??
    document.querySelector("main") ??
    document.querySelector('[role="main"]');

  return candidates ?? document.body;
};

/** Remove noise elements from a cloned DOM fragment. */
const removeNoise = (root: Element): void => {
  const noiseElements = root.querySelectorAll(NOISE_SELECTORS);

  for (const el of noiseElements) {
    el.remove();
  }
};

/** Create a configured TurndownService instance. */
const createTurndown = (): TurndownService => {
  const service = new TurndownService({
    headingStyle: "atx",
    codeBlockStyle: "fenced",
    bulletListMarker: "-",
    emDelimiter: "*",
    strongDelimiter: "**",
  });

  // Remove images — they add noise to the citation context
  service.remove("img");
  service.remove("figure");

  return service;
};

/**
 * Convert the visible page content to Markdown.
 * Finds the best content element, clones it, strips noise,
 * and runs it through Turndown. Output capped at ~4000 chars.
 */
export const parsePageContent = (): string => {
  const contentRoot = findContentRoot();
  const clone = contentRoot.cloneNode(true) as HTMLElement;

  removeNoise(clone);

  const turndown = createTurndown();
  let markdown = turndown.turndown(clone);

  // Collapse excessive whitespace
  markdown = markdown.replaceAll(/\n{3,}/g, "\n\n").trim();

  // Cap length
  if (markdown.length > MAX_MARKDOWN_LENGTH) {
    markdown = `${markdown.slice(0, MAX_MARKDOWN_LENGTH)}\n\n[...]`;
  }

  return markdown;
};

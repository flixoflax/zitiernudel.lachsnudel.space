import type { PageData } from "@/lib/types.ts";
import { extractMeta } from "./meta.ts";
import { parsePageContent } from "./parser.ts";

export default defineContentScript({
  matches: ["<all_urls>"],
  registration: "runtime",

  main(): PageData {
    const selectedText = window.getSelection()?.toString().trim() || null;
    const meta = extractMeta();
    const markdown = parsePageContent();

    return {
      url: location.href,
      title: document.title,
      selectedText,
      meta,
      markdown,
    };
  },
});

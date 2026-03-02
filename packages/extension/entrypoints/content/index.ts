import type { PageData } from "@/lib/types.ts";
import { extractMeta } from "./meta.ts";
import { parsePageContent } from "./parser.ts";
import { 
  extractPDFMetadata, 
  extractTitleFromURL, 
  fetchPDFBinary, 
  isPDFUrl} from "./pdf-utils.ts";

export default defineContentScript({
  matches: ["<all_urls>"],
  registration: "runtime",

  async main(): Promise<PageData> {
    const url = location.href;
    
    // Check if this is a PDF
    if (isPDFUrl(url)) {
      console.info('[ZitierNudel] Detected PDF, processing...');
      
      try {
        // Fetch PDF binary (works with paywalled PDFs using user's cookies)
        const pdfData = await fetchPDFBinary(url);
        
        // Extract metadata from PDF
        const metadata = await extractPDFMetadata(pdfData);
        
        // Convert ArrayBuffer to number array for JSON serialization
        const pdfDataArray = [...new Uint8Array(pdfData)];
        
        console.info('[ZitierNudel] PDF processed successfully:', {
          size: pdfData.byteLength,
          metadata,
        });
        
        return {
          isPDF: true,
          url,
          pdfData: pdfDataArray,
          title: metadata.title || extractTitleFromURL(url),
          selectedText: null,
          meta: {
            authors: metadata.author ? [metadata.author] : [],
            description: metadata.subject,
            siteName: null,
            publishedDate: metadata.creationDate,
            modifiedDate: null,
            ogTags: {},
            citationTags: {},
            ldJson: [],
          },
          metadata: {
            title: metadata.title,
            author: metadata.author,
            subject: metadata.subject,
            creationDate: metadata.creationDate,
            pageCount: metadata.pageCount,
          },
          markdown: undefined, // PDFs don't have markdown
        };
      } catch (error) {
        console.error('[ZitierNudel] Error processing PDF:', error);
        
        // Fallback: return basic data with error
        return {
          isPDF: true,
          url,
          title: extractTitleFromURL(url),
          selectedText: null,
          meta: {
            authors: [],
            description: null,
            siteName: null,
            publishedDate: null,
            modifiedDate: null,
            ogTags: {},
            citationTags: {},
            ldJson: [],
          },
          metadata: {
            title: null,
            author: null,
            subject: null,
            creationDate: null,
            pageCount: null,
          },
          markdown: undefined,
          _error: error instanceof Error ? error.message : 'Unknown error processing PDF',
        };
      }
    }
    
    // Regular web page flow
    console.info('[ZitierNudel] Processing regular web page');
    
    const selectedText = window.getSelection()?.toString().trim() || null;
    const meta = extractMeta();
    const markdown = parsePageContent();

    return {
      isPDF: false,
      url,
      title: document.title,
      selectedText,
      meta,
      markdown,
    };
  },
});

/**
 * PDF utility functions for ZitierNudel extension.
 * 
 * Handles PDF detection, binary fetching (including paywalled PDFs),
 * and metadata extraction using pdf.js.
 */

import * as pdfjsLib from 'pdfjs-dist';

// Set worker path for pdf.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

/**
 * Check if a URL points to a PDF file.
 */
export const isPDFUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);

    return urlObj.pathname.toLowerCase().endsWith('.pdf');
  } catch {
    return false;
  }
};

/**
 * Fetch PDF binary from URL.
 * Uses credentials: 'include' to handle paywalled PDFs with user's authentication.
 * Also handles local file:// URLs.
 */
export const fetchPDFBinary = async (url: string): Promise<ArrayBuffer> => {
  try {
    // Handle local file URLs
    if (url.startsWith('file://')) {
      console.info('[PDF Utils] Fetching local file:', url);
      const localResponse = await fetch(url);
      
      if (!localResponse.ok) {
        throw new Error(`Failed to fetch local PDF: ${localResponse.status} ${localResponse.statusText}`);
      }
      
      return await localResponse.arrayBuffer();
    }

    // Handle remote URLs with credentials for paywalled content
    console.info('[PDF Utils] Fetching remote PDF:', url);
    const response = await fetch(url, {
      credentials: 'include', // Include cookies for paywalled PDFs
      cache: 'no-cache',
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch PDF: ${response.status} ${response.statusText}`);
    }
    
    // Verify it's actually a PDF
    const contentType = response.headers.get('content-type');

    if (contentType && !contentType.includes('pdf')) {
      console.warn('[PDF Utils] Content-Type is not PDF:', contentType);
      throw new Error(`Not a PDF file. Content-Type: ${contentType}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();

    console.info('[PDF Utils] Successfully fetched PDF, size:', arrayBuffer.byteLength, 'bytes');
    
    return arrayBuffer;
  } catch (error) {
    console.error('[PDF Utils] Error fetching PDF:', error);
    
    if (url.startsWith('file://')) {
      throw new Error(
        'Cannot access local file. Browser security may prevent reading local files. ' +
        `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
    
    throw error;
  }
};

/**
 * Extract metadata from PDF binary using pdf.js.
 */
export const extractPDFMetadata = async (pdfData: ArrayBuffer): Promise<{
  title: string | null;
  author: string | null;
  subject: string | null;
  creationDate: string | null;
  pageCount: number | null;
}> => {
  try {
    console.info('[PDF Utils] Extracting metadata from PDF...');
    
    const loadingTask = pdfjsLib.getDocument({ data: pdfData });
    const pdf = await loadingTask.promise;
    const metadata = await pdf.getMetadata();
    
    const info = metadata.info as { Title?: string; Author?: string; Subject?: string; CreationDate?: string } | undefined;
    
    const result = {
      title: info?.Title ?? null,
      author: info?.Author ?? null,
      subject: info?.Subject ?? null,
      creationDate: info?.CreationDate ?? null,
      pageCount: pdf.numPages,
    };
    
    console.info('[PDF Utils] Extracted metadata:', result);
    
    return result;
  } catch (error) {
    console.error('[PDF Utils] Failed to extract PDF metadata:', error);
    
    // Return null values if extraction fails
    return {
      title: null,
      author: null,
      subject: null,
      creationDate: null,
      pageCount: null,
    };
  }
};

/**
 * Extract a title from the URL filename as fallback.
 */
export const extractTitleFromURL = (url: string): string => {
  try {
    const urlObj = new URL(url);
    const filename = urlObj.pathname.split('/').pop() || '';
    
    // Remove .pdf extension and clean up
    const cleaned = filename
      .replace('.pdf', '')
      .replaceAll(/[-_]/g, ' ')
      .trim();
    
    return cleaned || 'Untitled Document';
  } catch {
    return 'Untitled Document';
  }
};

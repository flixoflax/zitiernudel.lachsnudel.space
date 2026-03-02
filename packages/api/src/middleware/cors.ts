import { cors as honoCors } from "hono/cors";

/**
 * CORS middleware for ZitierNudel API.
 *
 * Allows requests from browser extensions (chrome-extension:// and moz-extension://).
 * This is required for the extension to communicate with the API.
 */
export const cors = (): ReturnType<typeof honoCors> => {
  return honoCors({
    origin: (origin) => {
      // Allow extension origins
      if (
        origin.startsWith("chrome-extension://") ||
        origin.startsWith("moz-extension://")
      ) {
        return origin;
      }

      // Allow localhost for development
      if (
        origin.includes("localhost") ||
        origin.includes("127.0.0.1") ||
        origin.includes("local.lachsnudel.space")
      ) {
        return origin;
      }

      // Deny all other origins
      return null;
    },
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    maxAge: 86400, // 24 hours
  });
};

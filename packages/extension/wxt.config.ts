import { defineConfig, type WxtViteConfig } from "wxt";
import tailwindcss from "@tailwindcss/vite";

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ["@wxt-dev/module-react"],
  manifest: {
    permissions: ["activeTab", "scripting", "clipboardWrite", "storage"],
  },
  hooks: {
    // The content script uses registration: "runtime" which causes WXT to add
    // its matches to host_permissions. We rely on activeTab instead, so strip
    // the generated host_permissions — but only in production builds.
    // During dev, WXT adds http://localhost/* to host_permissions so the
    /**
     * Extension can reach the Vite dev server without CORS errors.
     */
    // eslint-disable-next-line @typescript-eslint/naming-convention
    "build:manifestGenerated": (wxt, manifest) => {
      if (wxt.config.command === "build") {
        // eslint-disable-next-line no-restricted-syntax/noDeleteOperator
        delete manifest.host_permissions;
      }
    },
  },
  vite: () => {
    return {
      plugins: [tailwindcss()],
    } as WxtViteConfig;
  },
});

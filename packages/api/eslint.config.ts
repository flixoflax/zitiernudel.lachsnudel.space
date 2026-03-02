import { defineConfig } from "eslint/config";
import { sheriff, type SheriffSettings } from "eslint-config-sheriff";

const sheriffOptions: SheriffSettings = {
  react: false,
  lodash: false,
  remeda: false,
  next: false,
  astro: false,
  playwright: false,
  storybook: false,
  jest: false,
  vitest: false,
  tsconfigRootDir: import.meta.dirname,
};

export default defineConfig(sheriff(sheriffOptions), [
  {
    files: ["src/index.ts"],
    rules: {
      "import/no-default-export": "off",
      "import/no-anonymous-default-export": "off",
    },
  },
]);

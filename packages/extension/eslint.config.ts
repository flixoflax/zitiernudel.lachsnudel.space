import { defineConfig } from "eslint/config";
import { sheriff, type SheriffSettings } from "eslint-config-sheriff";

const sheriffOptions: SheriffSettings = {
  react: true,
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
    files: ["entrypoints/**/*.ts"],
    rules: {
      "no-restricted-globals": "off",
      "import/no-default-export": "off",
      "@typescript-eslint/restrict-template-expressions": [
        "error",
        {
          allowNumber: true,
        },
      ],
    },
  },
  {
    files: ["entrypoints/**/*.tsx"],
    rules: {
      "@typescript-eslint/no-misused-promises": "off",
    },
  },
]);

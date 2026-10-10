import typescriptPreset from "@peerigon/configs/eslint/presets/typescript";
import nodeRules from "@peerigon/configs/eslint/rules/node";
import vitestRules from "@peerigon/configs/eslint/rules/vitest";
import stylesNoDefaultExport from "@peerigon/configs/eslint/styles/no-default-export";

const nodeGlobals = nodeRules[0]?.languageOptions?.["globals"] ?? {};

export default [
  ...typescriptPreset,
  ...vitestRules,
  ...stylesNoDefaultExport,
  {
    // Standalone CLI scripts (e.g. the pentest sandbox setup), not app code.
    files: ["scripts/**/*.mjs"],
    languageOptions: {
      globals: nodeGlobals,
    },
    rules: {
      "unicorn/no-process-exit": "off",
    },
  },
];

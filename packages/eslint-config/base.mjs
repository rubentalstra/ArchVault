import js from "@eslint/js";
import tseslint from "typescript-eslint";

/** Shared base rules (TS type-checked). Consumer must add tsconfigRootDir + ignores. */
export const baseConfig = tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
);

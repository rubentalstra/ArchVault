import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import pluginQuery from "@tanstack/eslint-plugin-query";
import pluginRouter from "@tanstack/eslint-plugin-router";

export default tseslint.config(
  // Global ignores
  {
    ignores: [
      "dist/",
      ".output/",
      ".vinxi/",
      "node_modules/",
      "src/routeTree.gen.ts",
      "migrations/",
      "packages/",
      "eslint.config.mjs",
    ],
  },

  // Base JS recommended rules
  js.configs.recommended,

  // TypeScript recommended (type-checked)
  ...tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },

  // TanStack plugins (recommended presets)
  ...pluginQuery.configs["flat/recommended"],
  ...pluginRouter.configs["flat/recommended"],

  // React Hooks (flat config preset)
  reactHooks.configs.flat.recommended,

  // React Refresh
  {
    plugins: {
      "react-refresh": reactRefresh,
    },
    rules: {
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
    },
  },

  // Disable react-refresh for route files (they export Route + component by design)
  {
    files: ["src/routes/**/*.tsx"],
    rules: {
      "react-refresh/only-export-components": "off",
    },
  },

  // Project-specific overrides
  {
    rules: {
      // TanStack Router uses throw redirect() / throw notFound()
      "@typescript-eslint/only-throw-error": [
        "error",
        {
          allow: [
            {
              from: "package",
              package: "@tanstack/react-router",
              name: ["redirect", "notFound"],
            },
          ],
        },
      ],
      // Allow unused vars prefixed with _
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      // React event handlers commonly pass async functions — disable void-return checks for attributes
      "@typescript-eslint/no-misused-promises": [
        "error",
        { checksVoidReturn: { attributes: false } },
      ],
    },
  },
);

import { reactConfig } from "@archvault/eslint-config/react";

export default [
  { ignores: ["dist/", ".output/", ".vinxi/", "node_modules/", "src/routeTree.gen.ts", "src/paraglide/", "drizzle/", "eslint.config.mjs"] },
  ...reactConfig,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  // Route files export Route + component, not a single component
  {
    files: ["src/routes/**/*.tsx"],
    rules: { "react-refresh/only-export-components": "off" },
  },
];

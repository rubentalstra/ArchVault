import { libraryConfig } from "@archvault/eslint-config/library";

export default [
  { ignores: ["node_modules/", "eslint.config.mjs"] },
  ...libraryConfig,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
];

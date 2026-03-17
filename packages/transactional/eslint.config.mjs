import { libraryConfig } from "@archvault/eslint-config/library";

export default [
  { ignores: ["node_modules/", ".react-email/", "eslint.config.mjs"] },
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

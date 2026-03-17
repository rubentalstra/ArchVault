import { baseConfig } from "./base.mjs";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import pluginQuery from "@tanstack/eslint-plugin-query";
import pluginRouter from "@tanstack/eslint-plugin-router";

/** For React apps (web). Consumer must add tsconfigRootDir, ignores, and route overrides. */
export const reactConfig = [
  ...baseConfig,
  ...pluginQuery.configs["flat/recommended"],
  ...pluginRouter.configs["flat/recommended"],
  { ...reactHooks.configs.flat["recommended-latest"] },
  {
    plugins: { "react-refresh": reactRefresh },
    rules: {
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
    },
  },
  {
    rules: {
      "@typescript-eslint/only-throw-error": [
        "error",
        {
          allow: [
            {
              from: "package",
              package: "@tanstack/router-core",
              name: ["Redirect", "NotFoundError"],
            },
          ],
        },
      ],
      "@typescript-eslint/no-misused-promises": [
        "error",
        { checksVoidReturn: { attributes: false, properties: false } },
      ],
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-argument": "off",
      "@typescript-eslint/no-unsafe-return": "off",
    },
  },
];

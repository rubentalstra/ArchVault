import eslintPluginAstro from "eslint-plugin-astro";
import eslintPluginMdx from "eslint-plugin-mdx";

export default [
  ...eslintPluginAstro.configs.recommended,
  ...eslintPluginMdx.flat,
  {
    ignores: ["dist/", ".astro/", "node_modules/"],
  },
];

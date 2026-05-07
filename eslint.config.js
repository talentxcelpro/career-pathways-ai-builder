import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      "@typescript-eslint/no-unused-vars": "off",

      // ───────── FAANG-grade design-system guards (Wave 1) ─────────
      // Ban raw Tailwind heading sizes — use semantic ramp tokens instead.
      "no-restricted-syntax": [
        "warn",
        {
          selector:
            "JSXAttribute[name.name='className'][value.type='Literal'][value.value=/\\btext-(3xl|4xl|5xl|6xl|7xl)\\b/]",
          message:
            "Use semantic type ramp tokens (text-headline, text-display-1/2/3, text-title-1/2/3) — never raw text-3xl/4xl/5xl/6xl/7xl. See docs/UI_AUDIT.md.",
        },
        {
          selector:
            "JSXAttribute[name.name='style'] Property[key.name=/^(fontFamily|fontSize)$/]",
          message:
            "Do not set fontFamily/fontSize inline. SF Pro is global; sizing belongs to the ramp tokens. See docs/UI_AUDIT.md.",
        },
      ],
    },
  },
);

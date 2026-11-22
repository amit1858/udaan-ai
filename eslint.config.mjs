import tseslint from "typescript-eslint";
export default tseslint.config(
  { ignores: ["**/node_modules/**", "**/dist/**", "**/generated/**", "**/components/ui/**", "generated-artifacts/**", "artifacts/mockup-sandbox/**"] },
  ...tseslint.configs.recommended,
  { rules: { "@typescript-eslint/no-explicit-any": "off", "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }], "@typescript-eslint/no-empty-object-type": "off" } },
);

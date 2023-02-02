module.exports = {
  root: true,
  env: {
    node: true,
    es2021: true,
    "vue/setup-compiler-macros": true,
  },
  extends: [
    "eslint:recommended",
    "@vue/prettier",
    "@vue/typescript/recommended",
    "plugin:vue/vue3-essential",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:prettier/recommended",
    "plugin:import/errors",
    "plugin:import/warnings",
    "plugin:import/typescript",
    "plugin:promise/recommended",
  ],
  plugins: ["@typescript-eslint", "import", "prettier", "promise", "vue"],
  parserOptions: {
    ecmaVersion: 2020,
  },
  rules: {
    "no-console": "warn",
    "@typescript-eslint/explicit-module-boundary-types": "off",
  },
};

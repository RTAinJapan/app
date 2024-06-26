// @ts-check

import eslint from "@eslint/js";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import typescriptEslint from "typescript-eslint";

export default typescriptEslint.config(
	{ ignores: ["**/*.js"] },
	eslint.configs.recommended,
	...typescriptEslint.configs.strictTypeChecked,
	...typescriptEslint.configs.stylisticTypeChecked,
	{
		rules: {
			"@typescript-eslint/no-unused-vars": "off",
			"@typescript-eslint/only-throw-error": "off",
			"@typescript-eslint/no-unsafe-assignment": "warn",
			"@typescript-eslint/no-unsafe-call": "warn",
			"@typescript-eslint/no-unsafe-member-access": "warn",
		},
	},
	{
		languageOptions: {
			parserOptions: {
				project: true,
				tsconfigRootDir: import.meta.dirname,
			},
		},
	},
	{
		files: ["./projects/web/**/*.{ts,tsx}"],
		languageOptions: {
			parserOptions: {
				project: true,
				tsconfigRootDir: import.meta.resolve("./projects/web"),
			},
		},
	},
	{
		plugins: { "simple-import-sort": simpleImportSort },
		rules: {
			"simple-import-sort/imports": "error",
			"simple-import-sort/exports": "error",
		},
	},
);

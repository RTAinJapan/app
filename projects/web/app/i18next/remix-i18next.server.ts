import { RemixI18Next } from "remix-i18next/server";

import { bundleBackend } from "./backend";
import { i18nextOptions } from "./options";

export const remixI18next = new RemixI18Next({
	detection: {
		supportedLanguages: i18nextOptions.supportedLngs,
		fallbackLanguage: i18nextOptions.fallbackLng,
	},
	i18next: i18nextOptions,
	plugins: [bundleBackend],
});

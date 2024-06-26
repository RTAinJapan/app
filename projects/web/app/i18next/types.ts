import "i18next";

import en from "./translation/en.json";
import ja from "./translation/ja.json";

declare module "i18next" {
	interface CustomTypeOptions {
		resources: {
			translation: typeof en & typeof ja;
		};
	}
}

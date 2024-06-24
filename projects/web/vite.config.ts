import * as remix from "@remix-run/dev";
import { defineConfig } from "vite";

import { getLoadContext } from "./load-context";

export default defineConfig({
	plugins: [
		remix.cloudflareDevProxyVitePlugin({
			getLoadContext,
			persist: { path: import.meta.resolve("../../.wrangler/v3") },
		}),
		remix.vitePlugin({
			future: {
				v3_fetcherPersist: true,
				v3_relativeSplatPath: true,
				v3_throwAbortReason: true,
			},
		}),
	],
});

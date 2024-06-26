import * as remix from "@remix-run/dev";
import { defineConfig } from "vite";

import { getLoadContext } from "./load-context";

export default defineConfig({
	build: {
		target: ["chrome120", "edge120", "firefox120", "safari15.6", "node20"],
	},
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
	clearScreen: false,
});

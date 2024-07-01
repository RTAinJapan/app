import * as remix from "@remix-run/dev";
import browserslistToEsbuild from "browserslist-to-esbuild";
import { defineConfig } from "vite";

import { getLoadContext } from "./load-context";

export default defineConfig({
	plugins: [
		remix.cloudflareDevProxyVitePlugin({
			getLoadContext,
			persist: { path: import.meta.resolve("../database/.wrangler/state/v3") },
		}),
		remix.vitePlugin({
			future: {
				v3_fetcherPersist: true,
				v3_relativeSplatPath: true,
				v3_throwAbortReason: true,
				unstable_singleFetch: true,
			},
		}),
	],
	build: {
		target: browserslistToEsbuild([
			"last 2 chrome versions",
			"last 2 firefox versions",
			"last 2 edge versions",
			"last 2 safari versions",
		]),
	},
	clearScreen: false,
});

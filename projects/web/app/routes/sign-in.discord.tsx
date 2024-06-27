import { unstable_defineAction as defineAction } from "@remix-run/cloudflare";

export const action = defineAction(async ({ request, context }) => {
	return context.auth.authenticate("discord", request);
});

import { unstable_defineAction } from "@remix-run/cloudflare";

export const action = unstable_defineAction(async ({ request, context }) => {
	await context.auth.authenticate("discord", request);
	throw new Response();
});

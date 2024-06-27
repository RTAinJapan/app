import { unstable_defineAction as defineAction } from "@remix-run/cloudflare";

export const action = defineAction(({ request, context }) => {
	return context.auth.logout(request, { redirectTo: "/" });
});

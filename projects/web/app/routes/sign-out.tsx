import { unstable_defineAction } from "@remix-run/cloudflare";

export const action = unstable_defineAction(({ request, context }) => {
	return context.auth.logout(request, { redirectTo: "/" });
});

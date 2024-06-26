import { unstable_defineLoader } from "@remix-run/cloudflare";

export const loader = unstable_defineLoader(({ request, context }) => {
	return context.auth.authenticate("discord", request, {
		successRedirect: "/",
		failureRedirect: "/sign-in",
	});
});

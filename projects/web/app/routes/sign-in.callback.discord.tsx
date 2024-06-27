import { unstable_defineLoader as defineLoader } from "@remix-run/cloudflare";

export const loader = defineLoader(({ request, context }) => {
	return context.auth.authenticate("discord", request, {
		successRedirect: "/",
		failureRedirect: "/sign-in",
	});
});

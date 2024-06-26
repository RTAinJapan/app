import type { LoaderFunctionArgs } from "@remix-run/cloudflare";

export const loader = ({ request, context }: LoaderFunctionArgs) => {
	return context.auth.authenticate("discord", request, {
		successRedirect: "/",
		failureRedirect: "/sign-in",
	});
};

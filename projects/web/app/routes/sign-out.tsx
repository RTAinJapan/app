import type { ActionFunctionArgs } from "@remix-run/cloudflare";

export const action = ({ request, context }: ActionFunctionArgs) => {
	return context.auth.logout(request, { redirectTo: "/" });
};

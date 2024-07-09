import type { ActionFunctionArgs } from "@remix-run/cloudflare";
import { createThemeAction } from "remix-themes";

export const action = (args: ActionFunctionArgs) => {
	return createThemeAction(args.context.themeSessionResolver)(args);
};

import {
	json,
	type LinksFunction,
	type MetaFunction,
	unstable_defineLoader,
} from "@remix-run/cloudflare";
import {
	Links,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
} from "@remix-run/react";
import { useTranslation } from "react-i18next";

import { remixI18next } from "./i18next/remix-i18next.server";
import { useSafeRouteLoaderData } from "./lib/safe-use-route-loader-data";

export const meta: MetaFunction = () => [
	{ charSet: "utf-8" },
	{ name: "viewport", content: "width=device-width, initial-scale=1" },
];

export const links: LinksFunction = () => [];

export const loader = unstable_defineLoader(async ({ request, context }) => {
	const cookieHeader = request.headers.get("Cookie");
	const [locale, renewSession] = await Promise.all([
		remixI18next.getLocale(request),
		context.renewSessionCookie.parse(cookieHeader) as Promise<string | null>,
	]);
	if (!renewSession) {
		const session = await context.sessionStorage.getSession(cookieHeader);
		const [sessionCookie, renewSessionCookie] = await Promise.all([
			context.sessionStorage.commitSession(session),
			context.renewSessionCookie.serialize("1"),
		]);
		const headers = new Headers();
		headers.append("Set-Cookie", sessionCookie);
		headers.append("Set-Cookie", renewSessionCookie);
		return json({ locale }, { headers });
	}
	return { locale };
});

export const Layout = ({ children }: { children: React.ReactNode }) => {
	const data = useSafeRouteLoaderData<typeof loader>("root");
	const { i18n } = useTranslation();

	return (
		<html lang={data?.locale} dir={i18n.dir()}>
			<head>
				<Meta />
				<Links />
			</head>
			<body>
				{children}
				<ScrollRestoration />
				<Scripts />
			</body>
		</html>
	);
};

export default function App() {
	return <Outlet />;
}

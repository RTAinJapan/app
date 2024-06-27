import {
	type LinksFunction,
	type MetaFunction,
	unstable_defineLoader as defineLoader,
} from "@remix-run/cloudflare";
import {
	Links,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
	useRouteLoaderData,
} from "@remix-run/react";
import { useTranslation } from "react-i18next";

import { remixI18next } from "./i18next/remix-i18next.server";

export const meta: MetaFunction = () => [
	{ charSet: "utf-8" },
	{ name: "viewport", content: "width=device-width, initial-scale=1" },
];

export const links: LinksFunction = () => [];

export const loader = defineLoader(async ({ request }) => {
	const locale = await remixI18next.getLocale(request);
	return { locale };
});

export const Layout = ({ children }: { children: React.ReactNode }) => {
	const data = useRouteLoaderData<typeof loader>("root");
	const { i18n } = useTranslation();

	return (
		<html lang={data.locale} dir={i18n.dir()}>
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

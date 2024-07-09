import "./tailwind.css";

import {
	json,
	type LinksFunction,
	type LoaderFunctionArgs,
	type MetaFunction,
} from "@remix-run/cloudflare";
import {
	Form,
	Link,
	Links,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
	useLoaderData,
} from "@remix-run/react";
import clsx from "clsx";
import type { PropsWithChildren } from "react";
import { useTranslation } from "react-i18next";
import {
	PreventFlashOnWrongTheme,
	ThemeProvider,
	useTheme,
} from "remix-themes";

import { Button } from "./components/shadcn/button";
import { ThemeToggle } from "./components/theme-toggle";
import { remixI18next } from "./i18next/remix-i18next.server";
import { useSafeRouteLoaderData } from "./lib/safe-use-route-loader-data";
import { getUser } from "./lib/session.server";

export const meta: MetaFunction = () => [
	{ charSet: "utf-8" },
	{ name: "viewport", content: "width=device-width, initial-scale=1" },
];

export const links: LinksFunction = () => [];

const LayoutContent = ({ children }: PropsWithChildren) => {
	const data = useSafeRouteLoaderData<typeof loader>("root");
	const { i18n } = useTranslation();
	const [theme] = useTheme();

	return (
		<html className={clsx(theme)} lang={data?.locale ?? "en"} dir={i18n.dir()}>
			<head>
				<Meta />
				<PreventFlashOnWrongTheme ssrTheme={Boolean(data?.theme)} />
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

export const Layout = ({ children }: PropsWithChildren) => {
	const data = useSafeRouteLoaderData<typeof loader>("root");

	return (
		<ThemeProvider
			specifiedTheme={data?.theme ?? null}
			themeAction="/set-theme"
		>
			<LayoutContent>{children}</LayoutContent>
		</ThemeProvider>
	);
};

export const loader = async ({ request, context }: LoaderFunctionArgs) => {
	const cookieHeader = request.headers.get("Cookie");
	const [locale, renewSession, user, { getTheme }] = await Promise.all([
		remixI18next.getLocale(request),
		context.renewSessionCookie.parse(cookieHeader) as Promise<string | null>,
		getUser(request, context),
		context.themeSessionResolver(request),
	]);
	const theme = getTheme();
	if (!renewSession) {
		const session = await context.sessionStorage.getSession(cookieHeader);
		const [sessionCookie, renewSessionCookie] = await Promise.all([
			context.sessionStorage.commitSession(session),
			context.renewSessionCookie.serialize("1"),
		]);
		const headers = new Headers();
		headers.append("Set-Cookie", sessionCookie);
		headers.append("Set-Cookie", renewSessionCookie);
		return json({ locale, user, theme }, { headers });
	}
	return json({ locale, user, theme });
};

const Header = ({ displayName }: { displayName?: string }) => {
	const { t } = useTranslation();
	return (
		<header className="sticky flex">
			{displayName ? (
				<>
					<div>
						{t("hello")}, {displayName}
					</div>
					<Form method="post" action="/sign-out">
						<Button>Sign out</Button>
					</Form>
				</>
			) : (
				<Button asChild>
					<Link to="/sign-in">Sign in</Link>
				</Button>
			)}
			<ThemeToggle />
		</header>
	);
};

export default function Root() {
	const { user } = useLoaderData<typeof loader>();
	return (
		<>
			<Header displayName={user?.displayName} />
			<Outlet />
		</>
	);
}

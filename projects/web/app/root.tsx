import "./tailwind.css";
import "./ant-design-dark.css";

import {
	type AppLoadContext,
	json,
	type LinksFunction,
	type MetaFunction,
	unstable_defineLoader,
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
import { useTranslation } from "react-i18next";
import { HiMoon, HiSun } from "react-icons/hi";

import { remixI18next } from "./i18next/remix-i18next.server";
import { useSafeRouteLoaderData } from "./lib/safe-use-route-loader-data";

export const meta: MetaFunction = () => [
	{ charSet: "utf-8" },
	{ name: "viewport", content: "width=device-width, initial-scale=1" },
];

export const links: LinksFunction = () => [];

export const Layout = ({ children }: { children: React.ReactNode }) => {
	const data = useSafeRouteLoaderData<typeof loader>("root");
	const { i18n } = useTranslation();

	return (
		<html lang={data?.locale ?? "en"} dir={i18n.dir()}>
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

const getUser = async (request: Request, context: AppLoadContext) => {
	const session = await context.auth.isAuthenticated(request);
	if (!session) {
		return null;
	}
	return context.db.users.findUnique({
		where: { id: session.userId },
		select: { displayName: true },
	});
};

export const loader = unstable_defineLoader(async ({ request, context }) => {
	const cookieHeader = request.headers.get("Cookie");
	const [locale, renewSession, user] = await Promise.all([
		remixI18next.getLocale(request),
		context.renewSessionCookie.parse(cookieHeader) as Promise<string | null>,
		getUser(request, context),
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
		return json({ locale, user }, { headers });
	}
	return json({ locale, user });
});

const ThemeToggle = () => {
	const toggle = () => {
		const isDark = document.documentElement.classList.contains("dark");
		if (isDark) {
			document.documentElement.classList.remove("dark");
		} else {
			document.documentElement.classList.add("dark");
		}
	};

	return (
		<button
			aria-label="Toggle dark mode"
			onClick={toggle}
			className="text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 rounded-lg text-sm p-2.5"
		>
			<HiSun
				aria-label="Currently dark mode"
				className="h-5 w-5 hidden dark:block"
			/>
			<HiMoon
				aria-label="Currently light mode"
				className="h-5 w-5 dark:hidden"
			/>
		</button>
	);
};

const Header = ({ displayName }: { displayName?: string }) => {
	const { t } = useTranslation();
	return (
		<header className="sticky">
			{displayName ? (
				<>
					<div>
						{t("hello")}, {displayName}
					</div>
					<Form method="post" action="/sign-out">
						<button>Sign out</button>
					</Form>
				</>
			) : (
				<Link to="/sign-in">Sign in</Link>
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

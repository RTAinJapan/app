import "./tailwind.css";

import {
	type AppLoadContext,
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
import { Button, Navbar, ThemeModeScript } from "flowbite-react";
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
				<ThemeModeScript mode="auto" />
			</head>
			<body className="bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
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
	return context.db.user.findUnique({
		where: { id: session.userId },
		select: { displayName: true },
	});
};

export const loader = async ({ request, context }: LoaderFunctionArgs) => {
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
};

const ThemeToggle = () => {
	const toggle = () => {
		const isDark = document.documentElement.classList.contains("dark");
		if (isDark) {
			document.documentElement.classList.remove("dark");
			localStorage.setItem("flowbite-theme-mode", "light");
		} else {
			document.documentElement.classList.add("dark");
			localStorage.setItem("flowbite-theme-mode", "dark");
		}
	};

	return (
		<button
			aria-label="Toggle dark mode"
			onClick={toggle}
			className="rounded-lg p-2.5 text-sm text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-700"
		>
			<HiSun
				aria-label="Currently dark mode"
				className="hidden size-5 dark:block"
			/>
			<HiMoon
				aria-label="Currently light mode"
				className="size-5 dark:hidden"
			/>
		</button>
	);
};

const Header = ({ displayName }: { displayName?: string }) => {
	const { t } = useTranslation();
	return (
		<Navbar className="sticky flex">
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
				<Button as={Link} to="/sign-in">
					Sign in
				</Button>
			)}
			<ThemeToggle />
		</Navbar>
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

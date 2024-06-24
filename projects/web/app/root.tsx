import type { LinksFunction, MetaFunction } from "@remix-run/cloudflare";
import {
	Links,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
} from "@remix-run/react";

export const meta: MetaFunction = () => [
	{ charSet: "utf-8" },
	{ name: "viewport", content: "width=device-width, initial-scale=1" },
];

export const links: LinksFunction = () => [];

export const Layout = ({ children }: { children: React.ReactNode }) => {
	return (
		<html lang="en">
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

import { useRouteLoaderData } from "@remix-run/react";

export const useSafeRouteLoaderData = <T>(route: string) => {
	const data = useRouteLoaderData<T>(route);
	return data;
};

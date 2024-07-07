import { Outlet } from "@remix-run/react";

export default function AdminEventsLayout() {
	return <Outlet />;
}

export const handle = {
	breadcrumb: "Events",
};

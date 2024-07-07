import { Link, Outlet } from "@remix-run/react";
import { Breadcrumb } from "flowbite-react";

export default function AdminEventsLayout() {
	return <Outlet />;
}

export const handle = {
	breadcrumb: (
		<Breadcrumb.Item>
			<Link to="/admin/events">Events</Link>
		</Breadcrumb.Item>
	),
};

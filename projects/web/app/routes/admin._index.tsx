import { Link } from "@remix-run/react";

export default function AdminPage() {
	return (
		<div>
			<ul>
				<li>
					<Link to="./users">Users</Link>
				</li>
				<li>
					<Link to="./events">Events</Link>
				</li>
			</ul>
		</div>
	);
}

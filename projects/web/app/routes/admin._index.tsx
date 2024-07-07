import { Link } from "@remix-run/react";

export default function AdminPage() {
	return (
		<div>
			<ul>
				<li>
					<Link
						to="./users"
						className="text-blue-600 hover:underline dark:text-blue-500"
					>
						Users
					</Link>
				</li>
				<li>
					<Link
						to="./events"
						className="text-blue-600 hover:underline dark:text-blue-500"
					>
						Events
					</Link>
				</li>
			</ul>
		</div>
	);
}

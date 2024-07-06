import { unstable_defineLoader } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";

export const loader = unstable_defineLoader(async ({ context }) => {
	const users = await context.db.users.findMany({
		select: { displayName: true, discordId: true },
	});
	return { users };
});

export default function AdminUsersPage() {
	const { users } = useLoaderData<typeof loader>();

	return (
		<div>
			<h2>Users</h2>
			<table>
				<thead>
					<tr>
						<th>Display Name</th>
						<th>Discord ID</th>
					</tr>
				</thead>
				<tbody>
					{users.map((user) => (
						<tr key={user.discordId}>
							<td>{user.displayName}</td>
							<td>{user.discordId}</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}

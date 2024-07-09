import { json, type LoaderFunctionArgs } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import { Table } from "flowbite-react";

export const loader = async ({ context }: LoaderFunctionArgs) => {
	const users = await context.db.user.findMany({
		select: { displayName: true, discordId: true },
	});
	return json({ users });
};

export default function AdminUsersPage() {
	const { users } = useLoaderData<typeof loader>();

	return (
		<div className="flex flex-col items-start">
			<Table>
				<Table.Head>
					<Table.HeadCell>Display Name</Table.HeadCell>
					<Table.HeadCell>Discord ID</Table.HeadCell>
				</Table.Head>
				<Table.Body>
					{users.map((user) => (
						<Table.Row key={user.discordId}>
							<Table.Cell>{user.displayName}</Table.Cell>
							<Table.Cell>{user.discordId}</Table.Cell>
						</Table.Row>
					))}
				</Table.Body>
			</Table>
		</div>
	);
}

export const handle = {
	breadcrumb: 'Users',
};
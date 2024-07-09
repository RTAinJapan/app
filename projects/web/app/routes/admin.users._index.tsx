import { json, type LoaderFunctionArgs } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "../components/shadcn/table";

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
				<TableHeader>
					<TableRow>
						<TableHead>Display Name</TableHead>
						<TableHead>Discord ID</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{users.map((user) => (
						<TableRow key={user.discordId}>
							<TableCell>{user.displayName}</TableCell>
							<TableCell>{user.discordId}</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
}

export const handle = {
	breadcrumb: "Users",
};

import { json, type LoaderFunctionArgs } from "@remix-run/cloudflare";
import { Link, useLoaderData } from "@remix-run/react";

export const loader = async ({ context }: LoaderFunctionArgs) => {
	const submittableEvents = await context.db.events.findMany({
		where: { published: true, canSubmit: true },
		select: { id: true, fullName: true },
	});
	return json({ submittableEvents });
};

export default function IndexPage() {
	const data = useLoaderData<typeof loader>();

	return (
		<div>
			{data.submittableEvents.length === 0 ? (
				<p>No events are currently accepting submissions.</p>
			) : (
				<>
					<h1>Submission open</h1>
					<ul>
						{data.submittableEvents.map((event) => (
							<li key={event.id}>
								<Link to={`/events/${event.id.toFixed()}/submit`}>
									{event.fullName}
								</Link>
							</li>
						))}
					</ul>
				</>
			)}
		</div>
	);
}

import { json, type LoaderFunctionArgs } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";

export const loader = async ({ context }: LoaderFunctionArgs) => {
	const users = await context.db.query.users.findMany({
		columns: { id: true },
	});
	return json(users.length);
};

export default () => {
	const data = useLoaderData<typeof loader>();

	return (
		<div>
			<h1>Welcome to Remix on Cloudflare</h1>
			<div>{data}</div>
			<ul>
				<li>
					<a target="_blank" href="https://remix.run/docs" rel="noreferrer">
						Remix Docs
					</a>
				</li>
				<li>
					<a
						target="_blank"
						href="https://developers.cloudflare.com/pages/framework-guides/deploy-a-remix-site/"
						rel="noreferrer"
					>
						Cloudflare Pages Docs - Remix guide
					</a>
				</li>
			</ul>
		</div>
	);
};

import { Form } from "@remix-run/react";

import { Button } from "../components/shadcn/button";

export default function SignInPage() {
	return (
		<Form method="post" action="/sign-in/discord">
			<Button type="submit">Sign in with Discord</Button>
		</Form>
	);
}

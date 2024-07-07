import { Form } from "@remix-run/react";
import { Button } from "flowbite-react";

export default function SignInPage() {
	return (
		<Form method="post" action="/sign-in/discord">
			<Button type="submit">Sign in with Discord</Button>
		</Form>
	);
}

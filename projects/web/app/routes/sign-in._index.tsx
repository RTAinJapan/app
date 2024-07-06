import { Form } from "@remix-run/react";

export default function SignInPage() {
	return (
		<Form method="post" action="/sign-in/discord">
			<button>Sign in with Discord</button>
		</Form>
	);
}

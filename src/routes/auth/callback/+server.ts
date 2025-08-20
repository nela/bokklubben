import { AuthInternalError } from '$lib/errors/auth';
import { redirect, type RequestHandler } from '@sveltejs/kit';
import { err, fromPromise, ok } from 'neverthrow';

export const GET: RequestHandler = async ({ url, locals: { supabase } }) => {
	const code = url.searchParams.get('code') as string;
	const next = url.searchParams.get('next') ?? '/';

	if (!code) {
		// return redirect(303, '/auth?error=oauth_failed');
		// Return a raw HTML response that executes a client-side redirect.
		// This forces a full browser navigation, clearing the unwanted URL fragments.
		const redirectUrl = `${url.origin}/auth?error=oauth_failed`;
		return new Response(
			`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Redirecting...</title>
    <script>window.location.href = "${redirectUrl}";</script>
</head>
<body style="background-color:blue;">
</body>
</html>
`,
			{ headers: { 'Content-Type': 'text/html' } }
		);
	}

	const result = fromPromise(
		supabase.auth.exchangeCodeForSession(code),
		(e) => new AuthInternalError({ cause: e })
	).andThen((res) => (res.error ? err(new AuthInternalError({ cause: res.error })) : ok(res.data)));

	return result.match(
		() => redirect(303, `/${next.slice(1)}`),
		(e) => {
			console.error(e.message);
			return redirect(303, '/auth?error=oauth_failed');
		}
	);
};

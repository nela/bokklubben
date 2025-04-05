import { AuthUserNotFoundError } from '$lib/errors/auth';
import { createSessionCookie } from '$lib/server/auth/session';
import { error, json, redirect, type RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request, cookies }) => {
	const body = (await request.json()) as { idToken: string | undefined };

	if (!body.idToken) {
		throw redirect(303, '/login');
	}

	const expiresIn = 3600 * 1000;

	return createSessionCookie(body.idToken, expiresIn).match(
		(token) => {
			cookies.set('session', token, {
				maxAge: expiresIn,
				httpOnly: true,
				// secure: true,
				sameSite: 'lax',
				path: '/'
			});

			return json({ message: 'Signin successful.' }, { status: 200 });
		},
		(e) =>
			e instanceof AuthUserNotFoundError
				? error(401)
				: error(500, 'Failed to login. Please try again later.')
	);
};

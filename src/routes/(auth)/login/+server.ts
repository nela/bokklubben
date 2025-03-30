import { createSessionCookie } from '$lib/server/auth/session';
import { error, redirect, type RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request }: { request: Request }) => {
	const body = (await request.json()) as { idToken: string | undefined };

	if (!body.idToken) {
		throw redirect(303, '/login');
	}

	const expiresIn = 3600 * 1000 * 24;
	const sessionToken = await createSessionCookie(body.idToken, expiresIn);

	return sessionToken.match(
		(token) => {
			const options = {
				maxAge: expiresIn,
				httpOnly: true,
				// secure: true,
				sameSite: 'Lax',
				path: '/'
			};

			const header = new Headers();
			header.append('set-cookie', `session=${token}; ${JSON.stringify(options)}`);

			return new Response('login', {
				status: 200,
				headers: header
			});
		},
		(_) => error(500, { message: 'Failed to login. Please try again later.' })
	);
};

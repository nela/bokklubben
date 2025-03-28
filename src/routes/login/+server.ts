import { AuthenticationError } from '$lib/errors/auth';
import { createSessionToken } from '$lib/server/auth/util';
import { firebaseAdmin } from '$lib/server/firebase.admin';
import { error, redirect, type RequestHandler } from '@sveltejs/kit';
import { err, ResultAsync } from 'neverthrow';

export const POST: RequestHandler = async ({ request }: { request: Request }) => {
	const body = (await request.json()) as { idToken: string | undefined };

	if (!body.idToken) {
		throw redirect(303, '/login');
	}

	const expiresIn = 3600 * 1000 * 24;
	// const sessionToken = await createSessionToken(body.idToken, expiresIn);
  const sessionToken = new ResultAsync(Promise.reject('Simon says'))

	return sessionToken.match(
		(token) => {
			const options = {
				maxAge: expiresIn,
				httpOnly: true,
				// secure: true,
				sameSite: 'lax',
				path: '/'
			};

			const header = new Headers();
			header.append('set-cookie', `session=${token}; ${JSON.stringify(options)}`);

			return new Response('login', {
				status: 200,
				headers: header
			});
		},
		(err) => {
      console.log(`Error ${err}`);
      error(500, { message: 'Failed to login. Please try again later.' });
    }
	);
};

export const DELETE: RequestHandler = async () => {
	const header = new Headers();
	header.append('set-cookie', `session=; Max-Age=0`);

	return new Response('login', {
		status: 200,
		headers: header
	});
};

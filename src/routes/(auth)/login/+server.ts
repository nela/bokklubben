import { error, redirect, type RequestHandler } from '@sveltejs/kit';
import { err, ResultAsync } from 'neverthrow';

export const POST: RequestHandler = async ({ request }: { request: Request }) => {
	const body = (await request.json()) as { idToken: string | undefined };

	if (!body.idToken) {
		throw redirect(303, '/login');
	}

	const expiresIn = 3600 * 1000 * 24;
	// const sessionToken = await createSessionToken(body.idToken, expiresIn);
  const sessionToken = err('went wrong')

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
      console.error(`Error ASDFASDF ${err}`);
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

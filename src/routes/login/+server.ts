import { firebaseAdmin } from '$lib/server/firebase.admin';
import { redirect, type RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request }: { request: Request }) => {
	const body = (await request.json()) as { idToken: string | undefined };

	if (!body.idToken) {
		throw redirect(303, '/login');
	}

	const expiresIn = 60 * 60 * 24 * 5 * 1000;

	const sessionCookie = await firebaseAdmin.auth().createSessionCookie(body.idToken, { expiresIn });

	const options = {
		maxAge: expiresIn,
		httpOnly: true,
		// secure: true,
		sameSite: 'lax',
		path: '/'
	};

	const header = new Headers();
	header.append('set-cookie', `session=${sessionCookie}; ${JSON.stringify(options)}`);

	return new Response('login', {
		status: 200,
		headers: header
	});
};

export const DELETE: RequestHandler = async () => {
	const header = new Headers();
	header.append('set-cookie', `session=; Max-Age=0`);

	return new Response('login', {
		status: 200,
		headers: header
	});
};

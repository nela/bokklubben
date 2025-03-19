import { Routes } from '$lib/routeConfig';
import { firebaseAdmin } from '$lib/server/firebase.admin';
import { redirect, type Handle } from '@sveltejs/kit';
import type { DecodedIdToken } from 'firebase-admin/auth';

export const handle: Handle = async ({ event, resolve }) => {
	const start = performance.now();

	const session = event.cookies.get('session');

	if (!session) {
		event.locals.userSession = undefined;
		if (event.url.pathname !== Routes.login) {
			throw redirect(303, Routes.login);
		}
	} else {
		let decodedIdToken: DecodedIdToken | undefined = undefined;

		try {
			decodedIdToken = await firebaseAdmin.auth().verifySessionCookie(session, false);
		} catch (err) {
			console.error('Error verifying session cookie.', err);
			event.locals.userSession = undefined;
		}

		if (!decodedIdToken) {
			console.error('No decoded claims found.');
			event.locals.userSession = undefined;
		} else {
			console.info('User session verified.');
			const { uid, email } = decodedIdToken;
			event.locals.userSession = { uid, email };
		}
	}

	if (event.url.pathname !== Routes.login && !event.locals.userSession) {
		throw redirect(303, Routes.login);
	}

	console.debug(`Request took ${performance.now() - start}ms.`);

	const result = await resolve(
		event /* , {
    transformPageChunk: ({ html }) => html
  } */
	);

	return result;
};

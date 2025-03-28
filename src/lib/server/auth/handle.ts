import { type Handle } from '@sveltejs/kit';
import { deleteSessionTokenCookie, verifySessionToken } from './util';

export const authHandle: Handle = async ({ event, resolve }) => {
	const token = event.cookies.get('session');

	if (!token) {
		event.locals.user = undefined;
		return resolve(event);
	}

	const decodedIdToken = await verifySessionToken(token);

	if (decodedIdToken.isErr()) {
		deleteSessionTokenCookie(event.cookies);
		event.locals.user = undefined;
		return resolve(event);
	}
	const { uid, email } = decodedIdToken.value;
	// setSessionTokenCookie(event.cookies, token, new Date(exp));
	event.locals.user = { uid, email };

	return resolve(event);
};

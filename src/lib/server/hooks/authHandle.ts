import { type Handle } from '@sveltejs/kit';
import { deleteSessionCookie, verifySessionCookie } from '$lib/server/services/auth';

export const authHandle: Handle = async ({ event, resolve }) => {
	const token = event.cookies.get('session');

	if (!token) {
		event.locals.user = undefined;
		return resolve(event);
	}

	return verifySessionCookie(token).match(
		(decodedIdToken) => {
			const { uid, email, admin } = decodedIdToken;
			event.locals.user = {
				uid: uid,
				admin: admin ?? false,
				email: email!
			};
			return resolve(event);
		},
		() => {
			deleteSessionCookie(event.cookies);
			event.locals.user = undefined;
			return resolve(event);
		}
	);
};

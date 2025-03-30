import { type Handle } from '@sveltejs/kit';
import { deleteSessionCookie, verifySessionCookie } from '../auth/session';

export const authHandle: Handle = async ({ event, resolve }) => {
	const token = event.cookies.get('session');

	if (!token) {
		event.locals.user = undefined;
		return resolve(event);
	}

	const tokenPromise = await verifySessionCookie(token);

	return tokenPromise.match(
		(decodedToken) => {
			const { uid, email } = decodedToken;
			event.locals.user = { uid, email: email! };
			return resolve(event);
		},
		() => {
			deleteSessionCookie(event.cookies);
			event.locals.user = undefined;
			return resolve(event);
		}
	);
};

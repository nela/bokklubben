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
			const { uid, email, admin } = decodedToken;
			event.locals.user = {
        uid,
        admin: admin ?? false,
        email: email!
      };
			return resolve(event);
		},
		(_) => {
			deleteSessionCookie(event.cookies);
			event.locals.user = undefined;
			return resolve(event);
		}
	);
};

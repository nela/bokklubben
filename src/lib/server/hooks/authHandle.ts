import { type Handle } from '@sveltejs/kit';
import { deleteSessionTokenCookie as deleteSessionCookie, verifySessionCookie } from '../auth/session';

export const authHandle: Handle = async ({ event, resolve }) => {
	const token = event.cookies.get('session');

	if (!token) {
		event.locals.user = undefined;
		return resolve(event);
	}

	const tokenPromise = await verifySessionCookie(token);

  return tokenPromise.match(
    (token) => {
      const { uid, email } = token.value;
      event.locals.user = { uid, email };
      return resolve(event);
    },
    (_) => {
      deleteSessionCookie(event.cookies);
      event.locals.user = undefined;
      return resolve(event);
    }
  )
};

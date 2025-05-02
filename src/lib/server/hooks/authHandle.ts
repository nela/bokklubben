import { redirect, type Handle } from '@sveltejs/kit';
import { deleteSessionCookie, verifySessionCookie } from '$lib/server/services/auth';
import { createServerClient } from '@supabase/ssr';

const sbUrl = import.meta.env.VITE_SB_PUBLIC_URL;
const sbKey = import.meta.env.VITE_SB_PUBLIC_ANON_KEY;

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

export const supabaseHandle: Handle = async ({ event, resolve }) => {
	event.locals.supabase = createServerClient(sbUrl, sbKey, {
		cookies: {
			getAll: () => event.cookies.getAll(),
			setAll: (cookiesToSet) => {
				cookiesToSet.forEach(({ name, value, options }) => {
					event.cookies.set(name, value, { ...options, path: '/' });
				});
			}
		}
	});

	event.locals.safeGetSession = async () => {
		const {
			data: { session }
		} = await event.locals.supabase.auth.getSession();

		if (!session) {
			return { session: null, user: null };
		}

		const {
			data: { user },
			error
		} = await event.locals.supabase.auth.getUser();

		if (error) {
			return { session: null, user: null };
		}

		return { session, user };
	};

	return resolve(event, {
		filterSerializedResponseHeaders: (name) =>
			name === 'content-range' || name === 'x-supabase-api-version'
	});
};

const authGuard: Handle = async({ event, resolve }) => {
  const { session, user } = await event.locals.safeGetSession();
  event.locals.session = session;
  event.locals.user = user;

  if (!event.locals.session && !event.url.pathname.startsWith('/sign')) {
    throw redirect(303, '/signin')
  }

  if (event.locals.session && event.url.pathname.startsWith('/sign')) {
    throw redirect(303, '/')
  }

  return resolve(event);
}

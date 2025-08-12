import { redirect, type Handle } from '@sveltejs/kit';
import { createServerClient } from '@supabase/ssr';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import { fetchMemberByUuid } from '../db/queries';

export const supabaseHandle: Handle = async ({ event, resolve }) => {
	event.locals.supabase = createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
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

	event.locals.fetchMember = async (uuid: string) => {
		return fetchMemberByUuid(uuid).match(
			(m) => m,
			(_) => null
		);
	};

	return resolve(event, {
		filterSerializedResponseHeaders: (name) =>
			name === 'content-range' || name === 'x-supabase-api-version'
	});
};

export const authGuard: Handle = async ({ event, resolve }) => {
	const { session, user } = await event.locals.safeGetSession();

	if (!session || !user) {
		return event.url.pathname.startsWith('/auth') ? resolve(event) : redirect(303, '/auth');
	}

	event.locals.session = session;
	event.locals.user = user;

	if (event.locals.session && event.url.pathname.startsWith('/auth')) {
		throw redirect(303, '/');
	}

	const member = await event.locals.fetchMember(user.id);
	if (!member) {
		await event.locals.supabase.auth.signOut();
		event.locals.member = null;
		throw redirect(303, '/auth?error=unauthorized');
	}

	event.locals.member = member;

	if (member.appRole !== 'admin' && event.url.pathname.startsWith('/admin')) {
		throw redirect(303, '/');
	}

	return resolve(event);
};

export const permissionGuard: Handle = async ({ event, resolve }) => {
	event.locals.member = event.locals.user ? await event.locals.fetchMember(event.locals.user.id) : null;

	if (!event.locals.member) {
		await event.locals.supabase.auth.signOut();
		throw redirect(303, '/auth?error=unauthorized');
	}

	if (event.locals.member.appRole !== 'admin' && event.url.pathname.startsWith('/admin')) {
		throw redirect(303, '/');
	}

	return resolve(event);
}

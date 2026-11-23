import { building } from '$app/environment';
import { redirect, type Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { svelteKitHandler } from 'better-auth/svelte-kit';
import { auth } from '$lib/server/auth';
import { fetchMemberByUserId } from '$lib/server/db/queries';

const isAuthPage = (pathname: string) => pathname === '/auth' || pathname.startsWith('/auth/');

/** Serves Better Auth's own endpoints (`/api/auth/*`). */
const betterAuthHandle: Handle = ({ event, resolve }) =>
	svelteKitHandler({ event, resolve, auth, building });

const sessionHandle: Handle = async ({ event, resolve }) => {
	const result = await auth.api.getSession({ headers: event.request.headers });

	event.locals.session = result?.session ?? null;
	event.locals.user = result?.user ?? null;
	event.locals.member = result
		? await fetchMemberByUserId(result.user.id)
				.orTee((e) => console.error(e))
				.unwrapOr(null)
		: null;

	return resolve(event);
};

const guardHandle: Handle = async ({ event, resolve }) => {
	const { user, member } = event.locals;
	const { pathname } = event.url;

	if (!user) {
		return isAuthPage(pathname) ? resolve(event) : redirect(303, '/auth');
	}

	if (!member) {
		await auth.api.signOut({ headers: event.request.headers });
		redirect(303, '/auth?error=unauthorized');
	}

	if (isAuthPage(pathname)) {
		redirect(303, '/');
	}

	if (pathname.startsWith('/admin') && member.role !== 'admin') {
		redirect(303, '/');
	}

	return resolve(event);
};

export const handle = sequence(betterAuthHandle, sessionHandle, guardHandle);

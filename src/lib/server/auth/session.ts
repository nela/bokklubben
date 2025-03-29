import { AuthInternalError, type AuthError } from '$lib/errors/auth';
import { PublicRoute, UserRoute } from '$lib/utils/constants';
import type { Cookies } from '@sveltejs/kit';
import type { DecodedIdToken } from 'firebase-admin/auth';
import { fromPromise, type ResultAsync } from 'neverthrow';
import { firebaseAdmin } from '../firebase/firebase.admin';

export function createSessionCookie(idToken: string, expiresIn: number): ResultAsync<string, AuthError> {
	return fromPromise(
		firebaseAdmin.auth().createSessionCookie(idToken, { expiresIn }),
		(e) => new AuthInternalError({ cause: e })
	);
}

export function verifySessionCookie(token: string): ResultAsync<DecodedIdToken, AuthError> {
	return fromPromise(
		firebaseAdmin.auth().verifySessionCookie(token, true),
		(e) => new AuthInternalError({ cause: e })
	);
}

export function deleteSessionTokenCookie(cookies: Cookies) {
	cookies.set('session', '', {
		httpOnly: true,
		sameSite: 'lax',
		maxAge: 0,
		path: PublicRoute.Login
	});
}

export function setSessionTokenCookie(cookies: Cookies, token: string, expiresAt: Date): void {
	cookies.set('session', token, {
		httpOnly: true,
		sameSite: 'lax',
		expires: expiresAt,
		path: UserRoute.Dashboard
	});
}

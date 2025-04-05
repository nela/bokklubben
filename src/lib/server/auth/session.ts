import { AuthInternalError, AuthUserNotFoundError, type AuthError } from '$lib/errors/auth';
import type { Cookies } from '@sveltejs/kit';
import type { DecodedIdToken } from 'firebase-admin/auth';
import { errAsync, fromPromise, type ResultAsync } from 'neverthrow';
import { fetchRegisteredUserByParam } from '../db/queries';
import { firebaseAdmin } from '../firebase/firebase.admin';

function _createSessionCookie(idToken: string, expiresIn: number): ResultAsync<string, AuthError> {
	return fromPromise(
		firebaseAdmin.auth().createSessionCookie(idToken, { expiresIn }),
		(e) => new AuthInternalError({ cause: e })
	);
}

function _verifyIdToken(idToken: string) {
	return fromPromise(
		firebaseAdmin.auth().verifyIdToken(idToken, true),
		(e) => new AuthInternalError({ cause: e })
	);
}

function _deleteFirebaseAuthUser(uid: string) {
	return fromPromise(
		firebaseAdmin.auth().deleteUser(uid),
		(e) => new AuthUserNotFoundError({ cause: e })
	);
}

export function verifySessionCookie(token: string): ResultAsync<DecodedIdToken, AuthError> {
	return fromPromise(
		firebaseAdmin.auth().verifySessionCookie(token, true),
		(e) => new AuthInternalError({ cause: e })
	);
}

export function deleteSessionCookie(cookies: Cookies) {
	cookies.delete('session', {
		httpOnly: true,
		sameSite: 'lax',
		maxAge: 0,
		path: '/'
	});
}

export function setSessionCookie(cookies: Cookies, token: string, expiresAt: Date): void {
	cookies.set('session', token, {
		httpOnly: true,
		sameSite: 'lax',
		expires: expiresAt,
		path: '/'
	});
}

export function createSessionCookie(idToken: string, expiresIn: number) {
	return _verifyIdToken(idToken)
		.andThen((decodedIdToken) =>
			fetchRegisteredUserByParam({ key: 'uid', value: decodedIdToken.uid }).orElse((e) =>
				_deleteFirebaseAuthUser(decodedIdToken.uid).andThen(() =>
					errAsync(new AuthUserNotFoundError({ cause: e }))
				)
			)
		)
		.andThen(() => _createSessionCookie(idToken, expiresIn));
}

if (import.meta.env.VITEST) {
	module.exports.privateCreateSessionCookie = _createSessionCookie;
	module.exports.privateVerifyIdToken = _verifyIdToken;
	module.exports.privateDeleteFirebaseAuthUser = _deleteFirebaseAuthUser;
}

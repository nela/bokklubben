import { AuthInternalError, AuthUserNotFoundError, type AuthError } from '$lib/errors/auth';
import type { Cookies } from '@sveltejs/kit';
import type { DecodedIdToken } from 'firebase-admin/auth';
import { errAsync, fromPromise, type ResultAsync } from 'neverthrow';
import type { UserRegistrationDto } from '$lib/dto/dto';
import { firebaseAdmin } from '$lib/server/services/firebase';
import {
	deleteInvitationByParam,
	fetchInvitationByParam,
	fetchRegisteredUserByParam,
	storeUserRecord
} from '$lib/server/db/queries';
import type { UserRecord } from '$lib/server/db/model';

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

export function createSessionCookie(
	idToken: string,
	expiresIn: number
): ResultAsync<string, AuthError> {
	return fromPromise(
		firebaseAdmin.auth().createSessionCookie(idToken, { expiresIn }),
		(e) => new AuthInternalError({ cause: e })
	);
}

export function setSessionCookie(cookies: Cookies, token: string, maxAge: number): void {
	cookies.set('session', token, {
		httpOnly: true,
		sameSite: 'lax',
		maxAge: maxAge,
		path: '/'
	});
}

export function signupUser(body: UserRegistrationDto) {
	return fetchInvitationByParam({ key: 'email', value: body.email }).andThen((invitationRecord) =>
		storeUserRecord({
			uid: body.uid!,
			email: invitationRecord.email,
			firstName: invitationRecord.firstName,
			lastName: invitationRecord.lastName,
			username: body.username,
			admin: invitationRecord.admin ?? false,
			roles: invitationRecord.roles
		} satisfies UserRecord).andThen(() =>
			deleteInvitationByParam({ key: 'seed', value: invitationRecord.seed })
		)
	);
}

export function verifyIdToken(idToken: string): ResultAsync<UserRecord, AuthError> {
	return _verifyIdToken(idToken).andThen((decodedIdToken) =>
		fetchRegisteredUserByParam({ key: 'uid', value: decodedIdToken.uid }).orElse((e) =>
			_deleteFirebaseAuthUser(decodedIdToken.uid).andThen(() =>
				errAsync(new AuthUserNotFoundError({ cause: e }))
			)
		)
	);
}

if (import.meta.env.VITEST) {
	module.exports.privateVerifyIdToken = _verifyIdToken;
	module.exports.privateDeleteFirebaseAuthUser = _deleteFirebaseAuthUser;
}

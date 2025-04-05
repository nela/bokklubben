import { AuthInternalError, AuthUserNotFoundError } from '$lib/errors/auth';
import { type DbError } from '$lib/errors/db';
import type { DecodedIdToken } from 'firebase-admin/auth';
import { errAsync, okAsync } from 'neverthrow';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { UserRecord } from '../db/model';
import { fetchRegisteredUserByParam } from '../db/queries';
import { firebaseAdmin } from '../firebase/firebase.admin';
import * as session from './session';

vi.mock('../firebase/firebase.admin', () => ({
	firebaseAdmin: {
		auth: vi.fn().mockReturnValue({
			createSessionCookie: vi.fn(),
			verifySessionCookie: vi.fn(),
			verifyIdToken: vi.fn(),
			deleteUser: vi.fn()
		})
	}
}));

vi.mock('../db/queries', () => ({
	fetchRegisteredUserByParam: vi.fn()
}));

describe('Session utilities', () => {
	afterEach(() => {
		vi.clearAllMocks();
	});

	describe('private firebase _createSessionToken wrapper', () => {
		it('should return AuthenticationError when createSessionCookie fails', async () => {
			const errorMessage = 'SomethingBad';
			vi.mocked(firebaseAdmin.auth().createSessionCookie).mockRejectedValueOnce(
				new Error(errorMessage)
			);
			const idToken = 'idToken';
			const expiresIn = 1000;

			const res = await session.privateCreateSessionCookie(idToken, expiresIn);
			expect(res._unsafeUnwrapErr()).toBeInstanceOf(AuthInternalError);
		});

		it('should correctly return token on success', async () => {
			vi.mocked(firebaseAdmin.auth().createSessionCookie).mockResolvedValueOnce('token');
			const idToken = 'idToken';
			const expiresIn = 1000;

			const res = await session.privateCreateSessionCookie(idToken, expiresIn);

			expect(firebaseAdmin.auth().createSessionCookie).toHaveBeenCalledExactlyOnceWith(idToken, {
				expiresIn
			});
			expect(res._unsafeUnwrap()).toEqual('token');
		});
	});

	describe('private _deleteFirebaseUser wrapper', () => {
		it('should return AuthUserNotFoundError when deleteUser fails', async () => {
			const errorMessage = 'SomethingBad';
			vi.mocked(firebaseAdmin.auth().deleteUser).mockRejectedValue(new Error(errorMessage));
			const uid = 'uid';

			const res = await session.privateDeleteFirebaseAuthUser(uid);
			expect(res._unsafeUnwrapErr()).toBeInstanceOf(AuthUserNotFoundError);
		});

		it('wrapped deleteUser is called with correct argument', async () => {
			vi.mocked(firebaseAdmin.auth().deleteUser).mockResolvedValueOnce();
			const uid = 'uid';

			await session.privateDeleteFirebaseAuthUser(uid);

			expect(firebaseAdmin.auth().deleteUser(uid));
		});
	});

	describe('private firebase _verifyIdToken wrapper', () => {
		it('should return AuthenticationError when verifyIdToken fails', async () => {
			const errorMessage = 'SomethingBad';
			vi.mocked(firebaseAdmin.auth().verifyIdToken).mockRejectedValueOnce(new Error(errorMessage));
			const idToken = 'idToken';

			const res = await session.privateVerifyIdToken(idToken);
			expect(res._unsafeUnwrapErr()).toBeInstanceOf(AuthInternalError);
		});

		it('should correctly return decoded Id token on success', async () => {
			const expectedResult = {} as unknown as DecodedIdToken;
			vi.mocked(firebaseAdmin.auth().verifyIdToken).mockResolvedValueOnce(expectedResult);
			const idToken = 'idToken';

			const res = await session.privateVerifyIdToken(idToken);

			expect(firebaseAdmin.auth().verifyIdToken).toHaveBeenCalledExactlyOnceWith(idToken, true);
			expect(res._unsafeUnwrap()).toEqual(expectedResult);
		});
	});

	describe('verifySessionCookie', () => {
		it('should return AuthenticationError when verifySessionCookie fails', async () => {
			const errorMessage = 'SomethingBad';
			vi.mocked(firebaseAdmin.auth().verifySessionCookie).mockRejectedValueOnce(
				new Error(errorMessage)
			);

			const res = await session.verifySessionCookie('fake-cookie');
			expect(res._unsafeUnwrapErr()).toBeInstanceOf(AuthInternalError);
		});

		it('should correctly return token on success', async () => {
			const expectedRes = { uid: 'uid' } as unknown as DecodedIdToken;
			vi.mocked(firebaseAdmin.auth().verifySessionCookie).mockResolvedValueOnce(expectedRes);

			const res = await session.verifySessionCookie('correct-token');

			expect(firebaseAdmin.auth().verifySessionCookie).toHaveBeenCalledExactlyOnceWith(
				'correct-token',
				true
			);
			expect(res._unsafeUnwrap()).toEqual(expectedRes);
		});
	});

	describe('createSessionCookie', () => {
		it('should short-circuit calls on first error', async () => {
			vi.mocked(firebaseAdmin.auth().verifyIdToken).mockRejectedValueOnce(
				new Error('SomethingBad')
			);

			const res = await session.createSessionCookie('idToken', 1000);

			expect(res._unsafeUnwrapErr()).toBeInstanceOf(AuthInternalError);
			expect(vi.mocked(fetchRegisteredUserByParam)).not.toHaveBeenCalled();
		});

		it('should delete firebase authed user if user not present internally', async () => {
			const decodedIdToken = { uid: 'uid' } as unknown as DecodedIdToken;
			vi.mocked(firebaseAdmin.auth().verifyIdToken).mockResolvedValueOnce(decodedIdToken);
			vi.mocked(fetchRegisteredUserByParam).mockImplementationOnce(() =>
				errAsync(new Error('asdf') as DbError)
			);

			const idToken = 'idToken';
			const res = await session.createSessionCookie(idToken, 1000);

			expect(vi.mocked(firebaseAdmin.auth().verifyIdToken)).toHaveBeenCalledExactlyOnceWith(
				idToken,
				true
			);
			expect(vi.mocked(fetchRegisteredUserByParam)).toHaveBeenCalledExactlyOnceWith({
				key: 'uid',
				value: 'uid'
			});
			expect(vi.mocked(firebaseAdmin.auth().deleteUser)).toHaveBeenCalledExactlyOnceWith('uid');
			expect(res._unsafeUnwrapErr()).toBeInstanceOf(AuthUserNotFoundError);
			expect(firebaseAdmin.auth().createSessionCookie).not.toHaveBeenCalled();
		});

		it('should call createSessionCookie and should not call deleteUser', async () => {
			const decodedIdToken = { uid: 'uid' } as unknown as DecodedIdToken;
			vi.mocked(firebaseAdmin.auth().verifyIdToken).mockResolvedValueOnce(decodedIdToken);
			vi.mocked(fetchRegisteredUserByParam).mockImplementationOnce(() => okAsync({} as UserRecord));
			vi.mocked(firebaseAdmin.auth().createSessionCookie).mockResolvedValueOnce('token');

			const idToken = 'idToken';
			const res = await session.createSessionCookie(idToken, 1000);

			expect(vi.mocked(firebaseAdmin.auth().verifyIdToken)).toHaveBeenCalledExactlyOnceWith(
				idToken,
				true
			);
			expect(vi.mocked(fetchRegisteredUserByParam)).toHaveBeenCalledExactlyOnceWith({
				key: 'uid',
				value: 'uid'
			});
			expect(vi.mocked(firebaseAdmin.auth().deleteUser)).not.toHaveBeenCalled();
			expect(firebaseAdmin.auth().createSessionCookie).toHaveBeenCalled();
			expect(res._unsafeUnwrap()).toEqual('token');
		});
	});
});

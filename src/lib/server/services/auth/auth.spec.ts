import { AuthInternalError, AuthUserNotFoundError } from '$lib/errors/auth';
import { type DbError } from '$lib/errors/db';
import type { DecodedIdToken } from 'firebase-admin/auth';
import { errAsync, okAsync } from 'neverthrow';
import { afterEach, describe, expect, it, vi } from 'vitest';
import * as session from './auth';
import { fetchRegisteredUserByParam } from '$lib/server/db/queries';
import type { UserRecord } from '$lib/server/db/model';
import { firebaseAdmin } from '$lib/server/services/firebase';

vi.mock('$lib/server/services/firebase', () => ({
	firebaseAdmin: {
		auth: vi.fn().mockReturnValue({
			createSessionCookie: vi.fn(),
			verifySessionCookie: vi.fn(),
			verifyIdToken: vi.fn(),
			deleteUser: vi.fn()
		})
	}
}));

vi.mock('$lib/server/db/queries', () => ({
	fetchRegisteredUserByParam: vi.fn()
}));

describe('Server Auth Service', () => {
	afterEach(() => {
		vi.clearAllMocks();
	});

	describe('createSessionCookie', () => {
		it('should return AuthenticationError when createSessionCookie fails', async () => {
			const errorMessage = 'SomethingBad';
			vi.mocked(firebaseAdmin.auth().createSessionCookie).mockRejectedValueOnce(
				new Error(errorMessage)
			);

			const res = await session.createSessionCookie('idToken', 1000);
			expect(res._unsafeUnwrapErr()).toBeInstanceOf(AuthInternalError);
		});

		it('should correctly return token on success', async () => {
			const expectedRes = 'session-cookie';
			vi.mocked(firebaseAdmin.auth().createSessionCookie).mockResolvedValueOnce(expectedRes);

			const res = await session.createSessionCookie('idToken', 1000);

			expect(firebaseAdmin.auth().createSessionCookie).toHaveBeenCalledExactlyOnceWith('idToken', {
				expiresIn: 1000
			});
			expect(res._unsafeUnwrap()).toEqual(expectedRes);
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

	describe('verifyIdToken', () => {
		it('should short-circuit calls on first error', async () => {
			vi.mocked(firebaseAdmin.auth().verifyIdToken).mockRejectedValueOnce(
				new Error('SomethingBad')
			);

			const res = await session.verifyIdToken('idToken');

			expect(res._unsafeUnwrapErr()).toBeInstanceOf(AuthInternalError);
			expect(vi.mocked(fetchRegisteredUserByParam)).not.toHaveBeenCalled();
		});

		it('should delete firebase authed user if user not present internally', async () => {
			const decodedIdToken = { uid: 'uid' } as unknown as DecodedIdToken;
			vi.mocked(firebaseAdmin.auth().verifyIdToken).mockResolvedValueOnce(decodedIdToken);
			vi.mocked(firebaseAdmin.auth().deleteUser).mockResolvedValue();
			vi.mocked(fetchRegisteredUserByParam).mockImplementationOnce(() =>
				errAsync(new Error('asdf') as DbError)
			);

			const idToken = 'idToken';
			const res = await session.verifyIdToken(idToken);

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
		});

		it('should not delete user when user exists, eg. successfull call', async () => {
			const decodedIdToken = { uid: 'uid' } as unknown as DecodedIdToken;
			vi.mocked(firebaseAdmin.auth().verifyIdToken).mockResolvedValueOnce(decodedIdToken);
			vi.mocked(fetchRegisteredUserByParam).mockImplementationOnce(() => okAsync({} as UserRecord));

			const idToken = 'idToken';
			await session.verifyIdToken(idToken);

			expect(vi.mocked(firebaseAdmin.auth().verifyIdToken)).toHaveBeenCalledExactlyOnceWith(
				idToken,
				true
			);
			expect(vi.mocked(fetchRegisteredUserByParam)).toHaveBeenCalledExactlyOnceWith({
				key: 'uid',
				value: 'uid'
			});
			expect(vi.mocked(firebaseAdmin.auth().deleteUser)).not.toHaveBeenCalled();
		});
	});
});

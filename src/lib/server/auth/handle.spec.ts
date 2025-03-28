import { AuthenticationError } from '$lib/errors/auth';
import type { Cookies, RequestEvent } from '@sveltejs/kit';
import type { DecodedIdToken } from 'firebase-admin/auth';
import { errAsync, okAsync } from 'neverthrow';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mock, type MockProxy } from 'vitest-mock-extended';
import { authHandle } from './handle';
import { deleteSessionTokenCookie, verifySessionToken } from './util';

vi.mock('./util', () => ({
	verifySessionToken: vi.fn(),
	deleteSessionTokenCookie: vi.fn()
}));

describe('Authentication Hook', () => {
	let event: MockProxy<RequestEvent>;
	const resolveMock = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
		event = mock<RequestEvent>({
			cookies: mock<Cookies>({
				get: undefined
			}),
			locals: {
				user: undefined
			},
			url: new URL('https://127.0.0.1:5173')
		});
	});

	it('should return undefined local user when session cookie is not present', async () => {
		event.cookies.get = vi.fn().mockReturnValueOnce(undefined);
		event.locals.user = { uid: 'uid', email: 'n@n.no' };

		await authHandle({ event: event, resolve: resolveMock });

		expect(event.cookies.get).toHaveBeenCalledExactlyOnceWith('session');
		expect(event.locals.user).toBeUndefined();
		expect(resolveMock).toHaveBeenCalledExactlyOnceWith(event);
		expect(vi.mocked(verifySessionToken)).not.toHaveBeenCalled();
	});

	it('should delete session cookie when verifySessionToken returns error', async () => {
		event.cookies.get = vi.fn().mockReturnValueOnce('fake-session-token');
		vi.mocked(verifySessionToken).mockReturnValueOnce(
			errAsync(new AuthenticationError({ cause: 'Simon says.' }))
		);
		await authHandle({ event: event, resolve: resolveMock });

		expect(deleteSessionTokenCookie).toHaveBeenCalledExactlyOnceWith(event.cookies);
		expect(event.locals.user).toBeUndefined();
		expect(resolveMock).toHaveBeenCalledExactlyOnceWith(event);
	});

	it('should add user when valid session token', async () => {
		event.cookies.get = vi.fn().mockReturnValueOnce('correct-session-token');
		const expectedUser = { uid: 'uid', email: 'n@n.no' };

		vi.mocked(verifySessionToken).mockReturnValueOnce(
			okAsync(expectedUser as unknown as DecodedIdToken)
		);
		await authHandle({ event: event, resolve: resolveMock });

		expect(event.locals.user).toEqual(expectedUser);
		expect(resolveMock).toHaveBeenCalledExactlyOnceWith(event);
	});
});

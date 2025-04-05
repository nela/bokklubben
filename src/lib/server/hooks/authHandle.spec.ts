import { AuthInternalError } from '$lib/errors/auth';
import type { Cookies, RequestEvent } from '@sveltejs/kit';
import type { DecodedIdToken } from 'firebase-admin/auth';
import { errAsync, okAsync } from 'neverthrow';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mock, type MockProxy } from 'vitest-mock-extended';
import { authHandle } from './authHandle';
import { deleteSessionCookie, verifySessionCookie } from '../auth/session';

vi.mock('../auth/session', () => ({
	verifySessionCookie: vi.fn(),
	deleteSessionCookie: vi.fn()
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
		event.locals.user = { admin: true, uid: 'uid', email: 'n@n.no' };

		await authHandle({ event: event, resolve: resolveMock });

		expect(event.cookies.get).toHaveBeenCalledExactlyOnceWith('session');
		expect(event.locals.user).toBeUndefined();
		expect(resolveMock).toHaveBeenCalledExactlyOnceWith(event);
		expect(vi.mocked(verifySessionCookie)).not.toHaveBeenCalled();
	});

	it('should delete session cookie when verifySessionToken returns error', async () => {
		event.cookies.get = vi.fn().mockReturnValueOnce('fake-session-token');
		vi.mocked(verifySessionCookie).mockReturnValueOnce(
			errAsync(new AuthInternalError({ cause: 'Simon says.' }))
		);
		await authHandle({ event: event, resolve: resolveMock });

		expect(deleteSessionCookie).toHaveBeenCalledExactlyOnceWith(event.cookies);
		expect(event.locals.user).toBeUndefined();
		expect(resolveMock).toHaveBeenCalledExactlyOnceWith(event);
	});

	it('should add admin user when valid session token', async () => {
		event.cookies.get = vi.fn().mockReturnValueOnce('correct-session-token');
		const expectedUser = { admin: true, uid: 'uid', email: 'n@n.no' };

		vi.mocked(verifySessionCookie).mockReturnValueOnce(
			okAsync(expectedUser as unknown as DecodedIdToken)
		);
		await authHandle({ event: event, resolve: resolveMock });

		expect(event.locals.user).toEqual(expectedUser);
		expect(resolveMock).toHaveBeenCalledExactlyOnceWith(event);
	});
});

import { firebaseAdmin } from '$lib/server/firebase.admin';
import { beforeEach, describe, expect, it, vi, type Mocked } from 'vitest';
import { handle } from './hooks.server';
import { Routes } from '$lib/routeConfig';
import type { Cookies, RequestEvent } from '@sveltejs/kit';
import type { Auth } from 'firebase-admin/auth';

vi.mock('$lib/server/firebase.admin', () => ({
	firebaseAdmin: { auth: vi.fn() }
}));

describe('server hook', () => {
	let event: RequestEvent;
	const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

	beforeEach(() => {
		vi.clearAllMocks();
		event = {
			cookies: {} as unknown as Mocked<Cookies>,
			locals: {
				userSession: undefined
			},
			url: new URL('http://localhost:5173/')
		} as unknown as RequestEvent;
	});

	it('should throw redirect if no session cookie', async () => {
		event.cookies.get = vi.fn().mockReturnValue(undefined);
		const resolveFn = vi.fn();
		const res = handle({ event, resolve: resolveFn });

		expect(event.cookies.get).toHaveBeenCalledExactlyOnceWith('session');
		await expect(res).rejects.toEqual({ status: 303, location: Routes.login });
		expect(event.locals.userSession).toBeUndefined();
		expect(resolveFn).not.toHaveBeenCalled();
	});

	it('should throw redirect when verifySessionCookie throws error', async () => {
		event.cookies.get = vi.fn().mockReturnValue('invalid-session-cookie');
		vi.mocked(firebaseAdmin.auth).mockReturnValueOnce({
			verifySessionCookie: vi.fn().mockRejectedValueOnce(new Error('invalid cookie'))
		} as unknown as Auth);

		const resolveFn = vi.fn();
		const res = handle({ event, resolve: resolveFn });
		await expect(res).rejects.toEqual({ status: 303, location: Routes.login });
		expect(consoleErrorSpy).toHaveBeenCalledTimes(2);
		expect(event.locals.userSession).toBeUndefined();
		expect(resolveFn).not.toHaveBeenCalled();
	});

	it('should throw redirect if no decoded id token is found', async () => {
		event.cookies.get = vi.fn().mockReturnValue('not-existing-session-cookie');
		vi.mocked(firebaseAdmin.auth).mockReturnValueOnce({
			verifySessionCookie: vi.fn().mockReturnValueOnce(undefined)
		} as unknown as Auth);

		const resolveFn = vi.fn();
		const res = handle({ event, resolve: resolveFn });
		await expect(res).rejects.toEqual({ status: 303, location: Routes.login });
		expect(consoleErrorSpy).toHaveBeenCalledOnce();
		expect(event.locals.userSession).toBeUndefined();
		expect(resolveFn).not.toHaveBeenCalled();
	});

	it('should throw redirect if no decoded id token is found', async () => {
		event.cookies.get = vi.fn().mockReturnValue('session-cookie');
		vi.mocked(firebaseAdmin.auth).mockReturnValueOnce({
			verifySessionCookie: vi.fn().mockReturnValueOnce(undefined)
		} as unknown as Auth);

		const resolveFn = vi.fn();
		const res = handle({ event, resolve: resolveFn });
		await expect(res).rejects.toEqual({ status: 303, location: Routes.login });
		expect(consoleErrorSpy).toHaveBeenCalledOnce();
		expect(event.locals.userSession).toBeUndefined();
		expect(resolveFn).not.toHaveBeenCalled();
	});

	it('should return response to request with correct cookie', async () => {
		const decodedToken = {
			uid: 'uid',
			email: 'n@n.no'
		};
		event.cookies.get = vi.fn().mockReturnValue('session-cookie');
		vi.mocked(firebaseAdmin.auth).mockReturnValueOnce({
			verifySessionCookie: vi.fn().mockReturnValueOnce(decodedToken)
		} as unknown as Auth);

		const resolveFn = vi.fn().mockResolvedValueOnce(new Response());
		const res = await handle({ event, resolve: resolveFn });

		expect(res).toBeTruthy();

		expect(consoleErrorSpy).not.toHaveBeenCalled();
		expect(event.locals.userSession).toEqual(decodedToken);
		expect(resolveFn).toHaveBeenCalledOnce();
	});
});

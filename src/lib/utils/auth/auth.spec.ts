import { afterEach, describe, expect, it, vi } from 'vitest';
import { goto } from '$app/navigation';
import { PublicRoute, UserRoute } from '../constants';
import { signIn } from './auth';

vi.mock('$app/navigation', () => ({
	goto: vi.fn()
}));

describe('Sign Up', () => {
	const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
	const fetchSpy = vi.spyOn(global, 'fetch');
	const signOut = vi.fn();
	const authUser = {
		user: {
			getIdToken: vi.fn()
		}
	};

	afterEach(() => {
		vi.clearAllMocks();
	});

	it('should catch error and call signOut when authFn throws error', async () => {
		const authFn = vi.fn().mockRejectedValueOnce(new Error('Bad Request.'));

		await signIn(() => authFn(), signOut);

		expect(authFn).toHaveBeenCalledOnce();
		expect(fetchSpy).not.toHaveBeenCalled();
		expect(consoleErrorSpy).toHaveBeenCalledOnce();
		expect(goto).not.toHaveBeenCalled();
		expect(signOut).toHaveBeenCalledOnce();
	});

	it('should catch error and call signOut when fetching idToken fails', async () => {
		authUser.user.getIdToken.mockRejectedValueOnce('Oopsie');
		const authFn = vi.fn().mockImplementationOnce(() => authUser);

		await signIn(() => authFn(), signOut);

		expect(authFn).toHaveBeenCalledOnce();
		expect(authUser.user.getIdToken).toHaveBeenCalledOnce();
		expect(fetchSpy).not.toHaveBeenCalled();
		expect(consoleErrorSpy).toHaveBeenCalledOnce();
		expect(goto).not.toHaveBeenCalled();
		expect(signOut).toHaveBeenCalledOnce();
	});

	it('should catch error and call signout when fetch returns not ok', async () => {
		authUser.user.getIdToken.mockImplementationOnce(() => 'idToken');
		const authFn = vi.fn().mockImplementationOnce(() => authUser);
		fetchSpy.mockResolvedValueOnce(new Response(null, { status: 500 }));

		await signIn(() => authFn(), signOut);

		expect(authFn).toHaveBeenCalledOnce();
		expect(authUser.user.getIdToken).toHaveBeenCalledOnce();
		expect(fetchSpy).toHaveBeenCalledExactlyOnceWith(PublicRoute.Login, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: '{"idToken":"idToken"}'
		});
		expect(consoleErrorSpy).not.toHaveBeenCalledOnce();
		expect(goto).not.toHaveBeenCalled();
		expect(signOut).toHaveBeenCalledOnce();
	});

	it('should call goto when all authentication calls pass', async () => {
		authUser.user.getIdToken.mockImplementationOnce(() => 'idToken');
		const authFn = vi.fn().mockImplementationOnce(() => authUser);
		fetchSpy.mockResolvedValueOnce(new Response(null, { status: 200 }));

		await signIn(() => authFn(), signOut);

		expect(authFn).toHaveBeenCalledOnce();
		expect(authUser.user.getIdToken).toHaveBeenCalledOnce();
		expect(fetchSpy).toHaveBeenCalledExactlyOnceWith(PublicRoute.Login, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: '{"idToken":"idToken"}'
		});
		expect(consoleErrorSpy).not.toHaveBeenCalled();
		expect(goto).toHaveBeenCalledExactlyOnceWith(UserRoute.Dashboard);
		expect(signOut).toHaveBeenCalledOnce();
	});
});

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthProvider, performAuth } from './auth';
import {
	createUserWithEmailAndPassword,
	signInWithEmailAndPassword,
	type UserCredential
} from 'firebase/auth';
import { auth } from '$lib/services/firebase';

vi.mock('$lib/services/firebase', () => ({
	auth: {
		signOut: vi.fn()
	}
}));

vi.mock('firebase/auth', () => ({
	signInWithPopup: vi.fn(),
	signInWithEmailAndPassword: vi.fn(),
	createUserWithEmailAndPassword: vi.fn()
}));

describe('Auth service', () => {
	const formData = { email: 'mail', password: 'pass', username: 'username' };
	const fetchSpy = vi.spyOn(global, 'fetch');
	const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
	const authUser = {
		user: {
			getIdToken: vi.fn(),
			uid: '123',
			email: 'user@email.com'
		}
	};

	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('performAuth', () => {
		it(`should catch error and call signout when authfn throws error`, async () => {
			vi.mocked(signInWithEmailAndPassword).mockRejectedValueOnce(new Error('no bueno'));

			const res = await performAuth(AuthProvider.EMAIL, formData, 'signin');

			expect(res).toEqual({
				ok: false,
				error: 'no bueno'
			});
			expect(signInWithEmailAndPassword).toHaveBeenCalledOnce();
			expect(fetchSpy).not.toHaveBeenCalled();
			expect(consoleErrorSpy).toHaveBeenCalled();
			expect(auth.signOut).toHaveBeenCalledOnce();
		});

		it('should catch error and call signout when getIdToken throws error', async () => {
			vi.mocked(signInWithEmailAndPassword).mockResolvedValueOnce(
				authUser as unknown as UserCredential
			);
			vi.mocked(authUser.user.getIdToken).mockRejectedValueOnce(new Error('no bueno'));

			const res = await performAuth(AuthProvider.EMAIL, formData, 'signin');

			expect(res).toEqual({
				ok: false,
				error: 'no bueno'
			});
			expect(signInWithEmailAndPassword).toHaveBeenCalledOnce();
			expect(authUser.user.getIdToken).toHaveBeenCalledOnce();
			expect(fetchSpy).not.toHaveBeenCalled();
			expect(consoleErrorSpy).toHaveBeenCalled();
			expect(auth.signOut).toHaveBeenCalledOnce();
		});

		it('should catch error and call signout when fetch returns error code', async () => {
			vi.mocked(signInWithEmailAndPassword).mockResolvedValueOnce(
				authUser as unknown as UserCredential
			);
			vi.mocked(authUser.user.getIdToken).mockResolvedValueOnce('idToken');
			fetchSpy.mockResolvedValueOnce(new Response('woopsie', { status: 500 }));

			const res = await performAuth(AuthProvider.EMAIL, formData, 'signin');

			expect(res).toEqual({ ok: false, error: 'woopsie' });
			expect(signInWithEmailAndPassword).toHaveBeenCalledOnce();
			expect(authUser.user.getIdToken).toHaveBeenCalledOnce();
			expect(fetchSpy).toHaveBeenCalledOnce();
			expect(consoleErrorSpy).not.toHaveBeenCalled();
			expect(auth.signOut).toHaveBeenCalledOnce();
		});

		it('should return expected payload when all calls run successfully', async () => {
			vi.mocked(signInWithEmailAndPassword).mockResolvedValueOnce(
				authUser as unknown as UserCredential
			);
			vi.mocked(authUser.user.getIdToken).mockResolvedValueOnce('idToken');
			fetchSpy.mockResolvedValueOnce(new Response(null, { status: 200 }));

			const res = await performAuth(AuthProvider.EMAIL, formData, 'signin');
			expect(res).toEqual({ ok: true, error: undefined });
		});
	});

	describe('signin / signup', () => {
		beforeEach(() => {
			vi.mocked(authUser.user.getIdToken).mockResolvedValueOnce('idToken');
			fetchSpy.mockResolvedValueOnce(new Response(null, { status: 200 }));
		});

		it('should call correct functions with correct fetch payload when authType is signin', async () => {
			vi.mocked(signInWithEmailAndPassword).mockResolvedValueOnce(
				authUser as unknown as UserCredential
			);
			await performAuth(AuthProvider.EMAIL, formData, 'signin');

			expect(signInWithEmailAndPassword).toHaveBeenCalledExactlyOnceWith(
				auth,
				formData.email,
				formData.password
			);
			expect(fetchSpy).toHaveBeenCalledExactlyOnceWith('signin', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: '{"idToken":"idToken"}'
			});
		});

		it('should call correct functions with correct fetch payload when authType is signup', async () => {
			vi.mocked(createUserWithEmailAndPassword).mockResolvedValueOnce(
				authUser as unknown as UserCredential
			);
			await performAuth(AuthProvider.EMAIL, formData, 'signup');

			expect(createUserWithEmailAndPassword).toHaveBeenCalledExactlyOnceWith(
				auth,
				formData.email,
				formData.password
			);
			expect(fetchSpy).toHaveBeenCalledExactlyOnceWith('signup', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: '{"idToken":"idToken","uid":"123","email":"user@email.com","username":"username"}'
			});
		});
	});
});

import { goto } from '$app/navigation';
import type { LoginHandler } from '$lib/components/login/LoginHandler.model';
import { Routes } from '$lib/routeConfig';
import {
	signInWithEmailAndPassword,
	type Auth,
	type ParsedToken,
	type UserCredential
} from 'firebase/auth';

async function signIn<T, D = void>(
	fn: (auth: Auth, ...args: Array<T | D>) => Promise<UserCredential>,
	fnAuth: Auth,
	...fnArgs: Array<T | D>
) {
	try {
		const user = await fn(fnAuth, ...fnArgs);
		const idToken = await user.user.getIdToken();

		await fetch(Routes.login, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ idToken })
		});

		goto('/');
	} catch (ex) {
		console.error(ex);
	} finally {
		fnAuth.signOut();
	}
}

export const createLoginHandler = (auth: Auth): LoginHandler => ({
	emailAndPassword: (email: string, password: string) => () =>
		signIn(signInWithEmailAndPassword, auth, email, password)
});

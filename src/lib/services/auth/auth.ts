import {
	createUserWithEmailAndPassword,
	GithubAuthProvider,
	GoogleAuthProvider,
	OAuthProvider,
	signInWithEmailAndPassword,
	signInWithPopup,
	type UserCredential
} from 'firebase/auth';
import { auth } from '$lib/services/firebase';

export enum AuthProvider {
	GOOGLE = 'GOOGLE',
	MICROSOFT = 'MICROSOFT',
	GITHUB = 'GITHUB',
	EMAIL = 'EMAIL'
}

export type AuthType = 'signin' | 'signup';

export interface FormData {
	email: string;
	password: string;
	username?: string; // only required for signup
}

export function createProviderMap(
	form: FormData,
	authType: AuthType
): Record<AuthProvider, () => Promise<UserCredential>> {
	return {
		[AuthProvider.GOOGLE]: () => signInWithPopup(auth, new GoogleAuthProvider()),
		[AuthProvider.MICROSOFT]: () => signInWithPopup(auth, new OAuthProvider('microsoft.com')),
		[AuthProvider.GITHUB]: () => signInWithPopup(auth, new GithubAuthProvider()),
		[AuthProvider.EMAIL]: () =>
			authType === 'signin'
				? signInWithEmailAndPassword(auth, form.email, form.password)
				: createUserWithEmailAndPassword(auth, form.email, form.password)
	};
}

export async function performAuth(
	provider: AuthProvider,
	form: FormData,
	authType: AuthType
): Promise<{ ok: boolean; error?: unknown }> {
	const providerMap = createProviderMap(form, authType);
	let res: Response | undefined;
	let errorMessage: string | undefined;
	try {
		const userCredential = await providerMap[provider]();
		const idToken = await userCredential.user.getIdToken();
		const payload =
			authType === 'signin'
				? { idToken }
				: {
						idToken: idToken,
						uid: userCredential.user.uid,
						email: userCredential.user.email,
						username: form.username
					};

		res = await fetch(authType, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload)
		});
	} catch (e) {
		console.error(e);
		errorMessage = e instanceof Error ? e.message : undefined;
	} finally {
		await auth.signOut();
	}

	return {
		ok: res?.ok ?? false,
		error: res?.ok ? undefined : (errorMessage ?? (await res?.text()))
	};
}

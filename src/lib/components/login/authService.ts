import { goto } from '$app/navigation';
import { AuthenticationError } from '$lib/errors/auth';
import { PublicRoute, UserRoute } from '$lib/utils/constants';
import { type Auth, type UserCredential } from 'firebase/auth';
import { fromPromise } from 'neverthrow';

export interface EmailAuthCredentials {
	email: string;
	password: string;
}

export type AuthProvider = 'google' | 'email' | 'microsoft' | 'github';
export const performAuth = (auth: Auth, authFn: () => Promise<UserCredential>) => {
	return fromPromise(authFn(), (e) => new AuthenticationError({ cause: e }))
		.andThen((userCredential) =>
			fromPromise(userCredential.user.getIdToken(), (e) => new AuthenticationError({ cause: e }))
		)
		.andThen((idToken) =>
			fromPromise(
				fetch(PublicRoute.Login, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ idToken })
				}),
				(e) => {
					console.log(`first client err ${e}`);
					return new AuthenticationError({ cause: e });
				}
			)
		)
		.match(
			() => {
				goto(UserRoute.Dashboard);
				auth.signOut();
			},
			(e) => {
				console.log(`Logging from client err ${e}`);
				auth.signOut();
			}
		);
};

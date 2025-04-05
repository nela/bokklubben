<script lang="ts">
	import { validators } from '$lib/utils/helpers';
	import {
		GithubAuthProvider,
		GoogleAuthProvider,
		OAuthProvider,
		signInWithEmailAndPassword,
		signInWithPopup,
		type Auth,
		type UserCredential
	} from 'firebase/auth';

	export let signIn: (
		authFn: () => Promise<UserCredential>,
		signOut: () => Promise<void>
	) => Promise<void>;

	export let auth: Auth;

	type AuthProvider = 'google' | 'email' | 'microsoft' | 'github';

	const providerMap: Record<AuthProvider, () => Promise<UserCredential>> = {
		google: () => signInWithPopup(auth, new GoogleAuthProvider()),
		microsoft: () => signInWithPopup(auth, new OAuthProvider('microsoft.com')),
		github: () => signInWithPopup(auth, new GithubAuthProvider()),
		email: () => signInWithEmailAndPassword(auth, email, password)
	};

	const handleLogin = (provider: AuthProvider) => {
		signIn(providerMap[provider], () => auth.signOut());
	};

	let email: string = '';
	let password: string = '';

	let disabled = true;

	$: disabled = !(validators.parseEmail(email) && password.length > 5);
</script>

<h1>Velkommen skal du være</h1>
<h2>Håper du har lest boka til kommende samling</h2>
<div data-testid="email-pass-form" class="login-form">
	<input
		data-testid="email-input"
		aria-label="Email"
		type="email"
		placeholder="Email"
		bind:value={email}
		required
	/>
	<input
		data-testid="password-input"
		aria-label="Password"
		type="password"
		placeholder="Password"
		bind:value={password}
		required
	/>
	<button
		data-testid="email-pass-btn"
		aria-label="Log in with Email and Password"
		on:click={() => handleLogin('email')}
		{disabled}
	>
		Log in with Email and Password
	</button>
</div>

<button
	data-testid="google-auth-btn"
	aria-label="Log in with Google"
	on:click={() => handleLogin('google')}
>
	Log in with Google
</button>

<style>
	.login-form {
		border-radius: 2px;
		border: 2px solid blue;
	}
</style>

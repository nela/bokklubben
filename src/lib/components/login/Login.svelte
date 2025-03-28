<script lang="ts">
	import { GithubAuthProvider, GoogleAuthProvider, OAuthProvider, signInWithEmailAndPassword, signInWithPopup, type UserCredential } from "firebase/auth";
	import { performAuth, type AuthProvider } from "./authService";
	import { auth } from "$lib/firebase.client";

	// const emailRegex = /^(?!\.)(?!.*\.\.)([A-Z0-9_'+\-\.]*)[A-Z0-9_+-]@([A-Z0-9][A-Z0-9\-]*\.)+[A-Z]{2,}$/i;

	let email: string = '';
	let password: string = '';

	const emailMatcher = /^([a-z0-9_.-]+)@([\da-z.-]+).([a-z.]{2,6})$/;

	let disabled = true;
	$: disabled = !(emailMatcher.test(email) && password.length > 5);


  const providerMap: Record<AuthProvider, () => Promise<UserCredential>> = {
    google: () => signInWithPopup(auth, new GoogleAuthProvider()),
    microsoft: () => signInWithPopup(auth, new OAuthProvider('microsoft.com')),
    github: () => signInWithPopup(auth, new GithubAuthProvider()),
    email: () => signInWithEmailAndPassword(auth, email, password)
  }

  const handleLogin = (type: AuthProvider) => performAuth(auth, providerMap[type])


</script>

<h1>Velkommen skal du være</h1>
<h2>Håper du har lest boka til kommende samling</h2>
<div>
	<input aria-label="Email" type="email" placeholder="Email" bind:value={email} required />
	<input
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

<!-- <div data-testid="login-component" aria-label="Log In" class="login-form">
	<form data-testid="email-pass-form" on:submit={handler.emailAndPassword(email, password)}>
		<input aria-label="Email" type="email" placeholder="Email" bind:value={email} required />
		<input
			aria-label="Password"
			type="password"
			placeholder="Password"
			bind:value={password}
			required
		/>
		<button
			type="submit"
			data-testid="email-pass-btn"
			aria-label="Log in with Email and Password"
			on:click={handler.emailAndPassword(email, password)}
			{disabled}
		>
			Log in with Email and Password
		</button>
	</form>
</div>
-->
<style>
	.login-form {
		border-radius: 2px;
		border: 2px solid blue;
	}
</style>

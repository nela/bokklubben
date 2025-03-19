<script lang="ts">
	import type { LoginHandler } from './LoginHandler.model';

	let email: string = '';
	let password: string = '';

	const emailMatcher = /^([a-z0-9_.-]+)@([\da-z.-]+).([a-z.]{2,6})$/;

	let disabled = true;
	$: disabled = !(emailMatcher.test(email) && password.length > 5);

	export let handler: LoginHandler;
</script>

<div data-testid="login-component" aria-label="Log In" class="login-form">
	<form data-testid="email-pass-form" on:submit={handler.emailAndPassword(email, password)}>
		<h1>Velkommen skal du være</h1>
		<h2>Håper du har lest boka til kommende samling</h2>
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
			{disabled}
		>
			Log in with Email and Password
		</button>
	</form>
</div>

<style>
	.login-form {
		border-radius: 2px;
		border: 2px solid blue;
	}
</style>

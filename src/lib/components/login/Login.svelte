<script lang="ts">
	import { LoginHandler } from "./LoginHandler.model";

	let email: string = '';
	let password: string = '';

	const emailMatcher = /^([a-z0-9_\.-]+)@([\da-z\.-]+)\.([a-z\.]{2,6})$/;

	let disabled = true;
	$: disabled = !(emailMatcher.test(email) && password.length > 5);

	export let handler: LoginHandler;
</script>

<div data-testid="login-component" aria-label="Sign In" class="login-form">
  <form data-testid="email-pass-form" on:submit={handler.emailAndPassword(email, password)}>
	<h1>Sign In</h1>
	<input aria-label="Input Email" type="email" placeholder="Email" bind:value={email} required />
	<input aria-label="Input Password" type="password" placeholder="Password" bind:value={password} required />
	<button
		type="submit"
		data-testid="email-pass-btn"
		aria-label="Sign in with Email and Password"
		{disabled}
	>
		Sign In with Email and Passoword
	</button>
    </form>
</div>

<style>
	.login-form {
		border-radius: 2px;
		border: 2px solid blue;
	}
</style>

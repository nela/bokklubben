<script lang="ts">
	import { page } from '$app/state';
	import type { PageProps } from './$types';
	import { goto } from '$app/navigation';
	import { AuthProvider, performAuth, type AuthType } from '$lib/services/auth';
	import GoogleIcon from '$lib/components/icons/google-icon.svelte';
	import MicrosoftIcon from '$lib/components/icons/microsoft-icon.svelte';
	import GithubIcon from '$lib/components/icons/github-icon.svelte';

	const iconSize = 80;

	let { data }: PageProps = $props();

	const formData = $state({
		username: data.username ?? '',
		email: data.email ?? '',
		password: ''
	});

	async function onAuth(provider: AuthProvider) {
		const result = await performAuth(provider, formData, page.params.authType as AuthType);

		if (result.ok) {
			goto('/');
		}
	}
</script>

<div>
	{#if page.params.authType === 'signup'}
		<input
			data-testid="username-input"
			aria-label="Username"
			type="text"
			bind:value={formData.username}
			required
		/>
	{/if}

	<input
		data-testid="email-input"
		aria-label="Email"
		type="email"
		placeholder="Email"
		bind:value={formData.email}
		required
	/>
	<input
		data-testid="password-input"
		aria-label="Password"
		type="password"
		placeholder="Password"
		bind:value={formData.password}
		required
	/>
	<button
		data-testid="email-pass-btn"
		aria-label="Log in with Email and Password"
		onclick={() => onAuth(AuthProvider.EMAIL)}
	>
		Log in with Email and Password
	</button>

	<br />
	<GoogleIcon
		size={iconSize}
		onclick={() => onAuth(AuthProvider.GOOGLE)}
		aria-label="Sign in with Google"
	/>

	<MicrosoftIcon
		size={iconSize}
		onclick={() => onAuth(AuthProvider.MICROSOFT)}
		aria-label="Sign in with Microsoft"
	/>

	<GithubIcon
		size={iconSize}
		onclick={() => onAuth(AuthProvider.GITHUB)}
		aria-label="Sign in with Github"
	/>
</div>

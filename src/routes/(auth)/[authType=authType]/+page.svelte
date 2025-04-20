<script lang="ts">
	import { page } from '$app/state';
	import type { PageProps } from './$types';
	import { goto } from '$app/navigation';
	import { AuthProvider, performAuth, type AuthType } from '$lib/services/auth';

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

	<button
		data-testid="google-auth-btn"
		aria-label="Log in with Google"
		onclick={() => onAuth(AuthProvider.GOOGLE)}
	>
		Log in with google
	</button>

	<button
		data-testid="microsoft-auth-btn"
		aria-label="Log in with Microsoft"
		onclick={() => onAuth(AuthProvider.MICROSOFT)}
	>
		Log in with microsoft
	</button>

	<button
		data-testid="github-auth-btn"
		aria-label="Log in with github"
		onclick={() => onAuth(AuthProvider.GITHUB)}
	>
		Log in with github
	</button>
</div>

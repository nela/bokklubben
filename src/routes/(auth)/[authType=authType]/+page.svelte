<script lang="ts">
	import { page } from '$app/state';
	import type { PageProps } from './$types';
	import { goto } from '$app/navigation';
	import { AuthProvider, performAuth, type AuthType } from '$lib/services/auth';
	import GoogleIcon from '$lib/components/icons/google-icon.svelte';
	import MicrosoftIcon from '$lib/components/icons/microsoft-icon.svelte';
	import GithubIcon from '$lib/components/icons/github-icon.svelte';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import SubmitButton from '$lib/components/submit-button.svelte';
	import { validators } from '$lib/utils/helpers';
	import BkIcon from '$lib/components/icons/bk-icon.svelte';

	const iconSize = 80;

	let { data }: PageProps = $props();

	const formData = $state({
		username: data.username ?? '',
		email: data.email ?? '',
		password: ''
	});

	const submitDisabled = $derived({
		validInput: !validators.parseEmail(formData.email) || formData.password.length < 6,
		pending: false,
		success: false
	});

	const signInSignUp = $derived(page.params.authType === 'signin' ? 'Logg inn' : 'Bli medlem');

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
</div>

<div
	class="flex h-dvh w-screen items-start justify-center bg-background pt-12 md:items-center md:pt-0"
>
	<div class="flex w-full max-w-md flex-col gap-12 overflow-hidden rounded-2xl">
		<div class="flex flex-col items-center justify-center gap-2 px-4 text-center sm:px-16">
			<BkIcon size={100} />
			<!-- <h3 class="text-xl font-semibold dark:text-zinc-50">{signInSignUp}</h3> -->
			<!-- <p class="text-sm text-gray-500 dark:text-zinc-400"> -->
			<!-- 	Use your email and password to signin -->
			<!-- </p> -->
		</div>

		<div class="flex flex-col gap-4 px-4 sm:px-16 sm:py-2">
			{#if page.params.authType === 'signup'}
				<div class="flex flex-col gap-2 py-1">
					<Label for="email" class=" py-1 text-stone-600 dark:text-stone-400">Brukernavn</Label>
					<Input
						id="email"
						name="email"
						class="text-md md:text-sm"
						type="email"
						placeholder={formData.username ?? 'jegharlestboka@bokklubben.eu'}
						autocomplete="email"
						required
						autofocus
						bind:value={formData.email}
					/>
				</div>
			{/if}

			<div class="flex flex-col gap-2 py-1">
				<Label for="email" class=" py-1 text-stone-600 dark:text-stone-400">Epost</Label>
				<Input
					id="email"
					name="email"
					class="text-md md:text-sm"
					type="email"
					placeholder={formData.email.length > 0 ? formData.email : 'jegharlestboka@bokklubben.eu'}
					autocomplete="email"
					required
					autofocus
					bind:value={formData.email}
				/>
			</div>

			<div class="flex flex-col gap-2 py-1">
				<Label for="password" class="py-1 text-zinc-600 dark:text-zinc-400">Passord</Label>
				<Input
					id="password"
					name="password"
					type="password"
					required
					bind:value={formData.password}
				/>
			</div>
			<p class="flex justify-end text-sm text-gray-500 dark:text-zinc-400">Glemt passord?</p>

			<div class="flex flex-col gap-2 py-4">
				<SubmitButton
					disabled={submitDisabled.validInput}
					pending={submitDisabled.pending}
					success={submitDisabled.success}
				>
					{signInSignUp}
				</SubmitButton>
			</div>

			<div class="inline-flex flex-col justify-center gap-2 py-2">
				<hr class="h-px border-0 bg-gray-200 dark:bg-gray-700" />
				<p
					class="text-md absolute left-1/2 -translate-x-1/2 bg-white px-3 text-gray-500 dark:text-stone-400 md:text-sm"
				>
					eller
				</p>
			</div>

			<div class="flex grow justify-between gap-2 py-2">
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
		</div>
	</div>
</div>

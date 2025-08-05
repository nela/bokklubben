<script module lang="ts">
	export type FormSuccessData = {
		success: true;
	};
	export type FormFailureData = {
		success: false;
		message: string;
		email?: string;
	};
	export type FormData = FormSuccessData | FormFailureData;
</script>

<script>
	import SubmitButton from '$lib/components/submit-button.svelte';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import BkIcon from '$lib/components/icons/bk-icon.svelte';
	import GoogleIcon from '$lib/components/icons/google-icon.svelte';
	import GithubIcon from '$lib/components/icons/github-icon.svelte';
	import MicrosoftIcon from '$lib/components/icons/microsoft-icon.svelte';
	import { toast } from 'svelte-sonner';
	import { enhance } from '$app/forms';
	import type { SubmitFunction } from '@sveltejs/kit';

	const iconSize = 70;

	let { form } = $props();

	const disabled = false;

	let pending = $state(false);
	let success = $derived(!!form?.success);
	const enhanceCallback: SubmitFunction<FormSuccessData, FormFailureData> = () => {
		pending = true;

		return async ({ result, update }) => {
			if (result.type === 'failure' && result.data?.message) {
				toast.error(result.data.message, { duration: 5000 });
			}

			pending = false;
			update();
		};
	};
</script>

<div
	class="bg-background flex h-dvh w-screen items-start justify-center pt-12 md:items-center md:pt-0"
>
	<div class="flex w-full max-w-md flex-col gap-12 overflow-hidden rounded-2xl">
		<div class="flex flex-col items-center justify-center gap-2 px-4 text-center sm:px-16">
			<BkIcon size={150} />
		</div>

		<form
			method="POST"
			class="flex flex-col gap-4 px-4 pb-4 sm:px-16"
			action="?/supabase"
			use:enhance={enhanceCallback}
		>
			<div class="flex flex-col gap-2">
				<Label for="email" class=" text-zinc-600 dark:text-zinc-400">Epost</Label>

				<Input
					id="email"
					name="email"
					class="text-md bg-muted md:text-sm"
					type="email"
					placeholder="jegharlestboka@bokklubben.eu"
					autocomplete="email"
					autofocus
				/>
			</div>

			<div class="flex flex-col gap-2">
				<Label for="password" class="text-zinc-600 dark:text-zinc-400">Passord</Label>

				<Input id="password" name="password" class="text-md bg-muted md:text-sm" type="password" />
			</div>

			<SubmitButton {disabled} {pending} {success}>Logg inn</SubmitButton>

			<div class="inline-flex flex-col justify-center gap-2 py-2">
				<hr class="h-px border-0 bg-gray-200 dark:bg-gray-700" />
				<p
					class="text-md bg-background absolute left-1/2 -translate-x-1/2 px-3 text-gray-500 md:text-sm dark:text-stone-400"
				>
					eller
				</p>
			</div>

			<div class="flex grow justify-between gap-2 py-2">
				<button
					type="submit"
					formaction="?/provider"
					name="provider"
					value="google"
					class="rounded-lg p-2 hover:cursor-pointer hover:shadow-lg dark:shadow-zinc-600 [&_svg]:transition-transform hover:[&_svg]:scale-105"
				>
					<GoogleIcon size={iconSize} />
				</button>

				<button
					type="submit"
					formaction="?/provider"
					name="provider"
					value="microsoft"
					class="rounded-lg p-2 hover:cursor-pointer hover:shadow-lg dark:shadow-zinc-600 [&_svg]:transition-transform hover:[&_svg]:scale-105"
				>
					<MicrosoftIcon size={iconSize} />
				</button>

				<button
					type="submit"
					formaction="?/provider"
					name="provider"
					value="github"
					class="rounded-lg p-2 hover:cursor-pointer hover:shadow-md dark:shadow-zinc-600 [&_svg]:transition-transform hover:[&_svg]:scale-105"
				>
					<GithubIcon size={iconSize} />
				</button>
			</div>
		</form>
	</div>
</div>

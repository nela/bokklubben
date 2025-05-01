<script lang="ts">
	import type { Snippet } from 'svelte';
	import { Button } from './ui/button';
	import LoaderIcon from './icons/loader-icon.svelte';
	import type { MouseEventHandler } from 'svelte/elements';
	let {
		disabled,
		pending,
		success,
		onclick,
		children
	}: {
		disabled?: boolean;
		pending?: boolean;
		success?: boolean;
		onclick: MouseEventHandler<HTMLButtonElement>;
		children: Snippet;
	} = $props();
</script>

<Button
	type={pending ? 'button' : 'submit'}
	disabled={!!disabled || pending || success}
	class="relative"
	{onclick}
>
	{@render children()}

	{#if pending || success}
		<span class="absolute right-4 animate-spin">
			<LoaderIcon />
		</span>
	{/if}

	<output aria-live="polite" class="sr-only">
		{pending || success ? 'Laster' : 'Logg inn'}
	</output>
</Button>

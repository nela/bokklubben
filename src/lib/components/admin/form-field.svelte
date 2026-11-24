<script lang="ts">
	import type { Snippet } from 'svelte';
	import { Label } from '$lib/components/ui/label';

	let {
		label,
		id,
		errors,
		hint,
		class: className,
		children
	}: {
		label: string;
		/** The input's id, so clicking the label focuses it. */
		id?: string;
		errors?: Array<string>;
		hint?: string;
		class?: string;
		children: Snippet;
	} = $props();
</script>

<div class={['flex flex-col gap-2', className]}>
	<Label for={id}>{label}</Label>
	{@render children()}
	{#if errors?.length}
		<p class="text-destructive text-sm">{errors.join(' ')}</p>
	{:else if hint}
		<p class="text-muted-foreground text-sm">{hint}</p>
	{/if}
</div>

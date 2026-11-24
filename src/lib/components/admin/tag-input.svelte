<script lang="ts">
	import { X } from '@lucide/svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { cn } from '$lib/utils/shadcn';
	import SuggestInput from './suggest-input.svelte';

	let {
		id,
		name,
		values,
		suggestions,
		createLabel,
		placeholder,
		invalid = false
	}: {
		id: string;
		/** Each tag is submitted as its own `name` field. */
		name: string;
		/** The tags to start with. */
		values: Array<string>;
		suggestions: Array<string>;
		/** Label for the "create new" option, e.g. `Ny forfatter`. See SuggestInput. */
		createLabel: string;
		placeholder?: string;
		invalid?: boolean;
	} = $props();

	// Starts from `values`; after that the user's changes are the state.
	let tags = $state([...values]);
	let draft = $state('');

	const sameText = (a: string, b: string) => a.toLowerCase() === b.toLowerCase();
	const remaining = $derived(suggestions.filter((s) => !tags.some((t) => sameText(t, s))));
	const isNew = (tag: string) => !suggestions.some((s) => sameText(s, tag));

	/** Adds a tag, using a suggestion's spelling if it matches one. */
	function add(text: string) {
		const tag = text.trim();
		draft = '';
		if (!tag || tags.some((t) => sameText(t, tag))) {
			return;
		}
		tags.push(suggestions.find((s) => sameText(s, tag)) ?? tag);
	}

	function onkeydown(event: KeyboardEvent) {
		if (event.key === ',') {
			event.preventDefault();
			add(draft);
		} else if (event.key === 'Backspace' && draft === '' && tags.length > 0) {
			tags.pop();
		}
	}
</script>

<div
	class={cn(
		'border-input bg-background dark:bg-input/30 flex min-h-9 w-full flex-wrap items-center gap-1 rounded-md border px-2 py-1 text-base shadow-xs transition-[color,box-shadow] md:text-sm',
		'focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px]',
		invalid && 'border-destructive ring-destructive/20 dark:ring-destructive/40'
	)}
>
	{#each tags as tag (tag)}
		<Badge variant={isNew(tag) ? 'outline' : 'secondary'} class="gap-1 pr-1">
			{tag}
			{#if isNew(tag)}
				<span class="text-muted-foreground text-xs font-normal">(ny)</span>
			{/if}
			<button
				type="button"
				class="hover:text-foreground text-muted-foreground rounded-sm"
				aria-label={`Fjern ${tag}`}
				onclick={() => (tags = tags.filter((t) => t !== tag))}
			>
				<X class="size-3" />
			</button>
		</Badge>
		<input type="hidden" {name} value={tag} />
	{/each}
	<SuggestInput
		{id}
		bind:value={draft}
		suggestions={remaining}
		known={[...suggestions, ...tags]}
		{createLabel}
		placeholder={tags.length === 0 ? placeholder : undefined}
		{invalid}
		boxed={false}
		class="min-w-24 flex-1 px-1 py-0.5"
		onselect={add}
		onenter={add}
		{onkeydown}
	/>
</div>

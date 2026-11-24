<script lang="ts">
	import { X } from '@lucide/svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { cn } from '$lib/utils/shadcn';

	let {
		id,
		name,
		values,
		suggestions,
		placeholder,
		invalid = false
	}: {
		id: string;
		/** Each tag is submitted as its own `name` field. */
		name: string;
		/** The tags to start with. */
		values: Array<string>;
		suggestions: Array<string>;
		placeholder?: string;
		invalid?: boolean;
	} = $props();

	// Starts from `values`; after that the user's changes are the state.
	let tags = $state([...values]);
	let draft = $state('');

	const remaining = $derived(
		suggestions.filter((s) => !tags.some((t) => t.toLowerCase() === s.toLowerCase()))
	);

	/** Adds the typed text as a tag, using a suggestion's spelling if it matches one. */
	function add() {
		const text = draft.trim();
		draft = '';
		if (!text || tags.some((t) => t.toLowerCase() === text.toLowerCase())) {
			return;
		}
		tags.push(suggestions.find((s) => s.toLowerCase() === text.toLowerCase()) ?? text);
	}

	function onkeydown(event: KeyboardEvent) {
		if (event.key === 'Enter' || event.key === ',') {
			event.preventDefault();
			add();
		} else if (event.key === 'Backspace' && draft === '' && tags.length > 0) {
			tags.pop();
		}
	}

	/** Picking from the suggestion list fills the input in one go; add it right away. */
	function oninput(event: Event) {
		const { inputType } = event as InputEvent;
		if ((!inputType || inputType === 'insertReplacementText') && suggestions.includes(draft)) {
			add();
		}
	}
</script>

<div
	class={cn(
		'border-input bg-background dark:bg-input/30 flex min-h-9 w-full flex-wrap items-center gap-1 rounded-md border px-2 py-1 shadow-xs transition-[color,box-shadow]',
		'focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px]',
		invalid && 'border-destructive ring-destructive/20 dark:ring-destructive/40'
	)}
>
	{#each tags as tag (tag)}
		<Badge variant="secondary" class="gap-1 pr-1">
			{tag}
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
	<input
		{id}
		list={`${id}-suggestions`}
		autocomplete="off"
		class="placeholder:text-muted-foreground min-w-24 flex-1 bg-transparent px-1 py-0.5 text-base outline-none md:text-sm"
		placeholder={tags.length === 0 ? placeholder : undefined}
		aria-invalid={invalid}
		bind:value={draft}
		{onkeydown}
		{oninput}
		onblur={add}
	/>
	<datalist id={`${id}-suggestions`}>
		{#each remaining as suggestion (suggestion)}
			<option value={suggestion}></option>
		{/each}
	</datalist>
</div>

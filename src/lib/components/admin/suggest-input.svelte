<script lang="ts">
	import { Plus } from '@lucide/svelte';
	import { cn } from '$lib/utils/shadcn';

	let {
		id,
		name,
		value = $bindable(''),
		suggestions,
		createLabel,
		known,
		placeholder,
		invalid = false,
		boxed = true,
		class: className,
		onselect,
		onenter,
		onkeydown,
		onblur
	}: {
		id: string;
		/** Leave out when the value is submitted some other way (e.g. as tags). */
		name?: string;
		value?: string;
		suggestions: Array<string>;
		/**
		 * Label for an extra "create new" option, shown when the typed text isn't a suggestion,
		 * e.g. `Ny forfatter`. Without it, only suggestions are listed.
		 */
		createLabel?: string;
		/** Values that don't get a "create new" option. Defaults to `suggestions`. */
		known?: Array<string>;
		placeholder?: string;
		invalid?: boolean;
		/** Styled like a regular input. Off when it sits inside another box, as in TagInput. */
		boxed?: boolean;
		class?: string;
		/** A suggestion, or the typed text through the "create new" option, was picked. */
		onselect?: (value: string) => void;
		/** Enter was pressed without an option highlighted. Without it, Enter submits the form. */
		onenter?: (text: string) => void;
		/** Runs first; call `preventDefault()` to skip the built-in handling. */
		onkeydown?: (event: KeyboardEvent) => void;
		onblur?: () => void;
	} = $props();

	type Option = { value: string; isNew: boolean };

	let open = $state(false);
	let active = $state(-1);

	const listId = $derived(`${id}-suggestions`);
	const options = $derived.by((): Array<Option> => {
		const text = value.trim();
		const query = text.toLowerCase();
		const matches = suggestions
			.filter((s) => s.toLowerCase().includes(query))
			.map((s) => ({ value: s, isNew: false }));
		const isKnown = (known ?? suggestions).some((s) => s.toLowerCase() === query);
		return createLabel && text && !isKnown ? [...matches, { value: text, isNew: true }] : matches;
	});
	const showList = $derived(open && options.length > 0);

	function choose(option: string) {
		value = option;
		open = false;
		active = -1;
		onselect?.(option);
	}

	function handleKeydown(event: KeyboardEvent) {
		onkeydown?.(event);
		if (event.defaultPrevented) {
			return;
		}

		switch (event.key) {
			case 'ArrowDown':
				event.preventDefault();
				open = true;
				active = Math.min(active + 1, options.length - 1);
				break;
			case 'ArrowUp':
				event.preventDefault();
				active = Math.max(active - 1, -1);
				break;
			case 'Enter':
				if (showList && active >= 0) {
					event.preventDefault();
					choose(options[active].value);
				} else if (onenter) {
					event.preventDefault();
					onenter(value);
				}
				break;
			case 'Escape':
				open = false;
				active = -1;
				break;
		}
	}
</script>

<div
	class={cn(
		'relative',
		boxed && [
			'border-input bg-background dark:bg-input/30 flex h-9 w-full items-center rounded-md border px-3 text-base shadow-xs transition-[color,box-shadow] md:text-sm',
			'focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px]',
			invalid && 'border-destructive ring-destructive/20 dark:ring-destructive/40'
		],
		className
	)}
>
	<input
		{id}
		{name}
		{placeholder}
		bind:value
		role="combobox"
		autocomplete="off"
		aria-autocomplete="list"
		aria-expanded={showList}
		aria-controls={listId}
		aria-activedescendant={showList && active >= 0 ? `${listId}-${active}` : undefined}
		aria-invalid={invalid}
		class="placeholder:text-muted-foreground w-full bg-transparent outline-none"
		onfocus={() => (open = true)}
		oninput={() => {
			open = true;
			active = -1;
		}}
		onblur={() => {
			open = false;
			active = -1;
			onblur?.();
		}}
		onkeydown={handleKeydown}
	/>

	{#if showList}
		<ul
			id={listId}
			role="listbox"
			class="bg-popover text-popover-foreground absolute top-full left-0 z-50 mt-2 max-h-60 w-full min-w-48 overflow-y-auto rounded-md border p-1 shadow-md"
		>
			{#each options as option, i (`${option.isNew}:${option.value}`)}
				<li
					id={`${listId}-${i}`}
					role="option"
					aria-selected={i === active}
					class={cn(
						'cursor-pointer rounded-sm px-2 py-1.5 text-sm',
						option.isNew && 'flex items-center gap-1.5',
						option.isNew && i > 0 && 'mt-1 border-t pt-2',
						i === active ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/50'
					)}
					onmousedown={(event) => {
						// Keep focus in the input, so its blur doesn't close the list first.
						event.preventDefault();
						choose(option.value);
					}}
				>
					{#if option.isNew}
						<Plus class="size-3.5 shrink-0" />
						<span>{createLabel}: <strong>«{option.value}»</strong></span>
					{:else}
						{option.value}
					{/if}
				</li>
			{/each}
		</ul>
	{/if}
</div>

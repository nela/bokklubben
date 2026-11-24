<script lang="ts">
	import { Plus, X } from '@lucide/svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import Select from './select.svelte';

	let {
		id,
		name,
		chosen = $bindable([]),
		options,
		selectLabel,
		createLabel,
		oncreate,
		invalid = false
	}: {
		id: string;
		/** Each chosen value is submitted as its own `name` field. */
		name: string;
		chosen?: Array<string>;
		/** Existing values to choose from. */
		options: Array<string>;
		/** First line of the dropdown, e.g. `Velg forfatter…`. */
		selectLabel: string;
		/** The button for creating a new value, e.g. `Legg til ny forfatter`. */
		createLabel: string;
		oncreate: () => void;
		invalid?: boolean;
	} = $props();

	const available = $derived(options.filter((o) => !chosen.includes(o)));
</script>

<div class="flex flex-col gap-2">
	{#if chosen.length > 0}
		<div class="flex flex-wrap gap-1">
			{#each chosen as value (value)}
				<Badge variant="secondary" class="gap-1 pr-1">
					{value}
					<button
						type="button"
						class="hover:text-foreground text-muted-foreground rounded-sm"
						aria-label={`Fjern ${value}`}
						onclick={() => (chosen = chosen.filter((c) => c !== value))}
					>
						<X class="size-3" />
					</button>
				</Badge>
				<input type="hidden" {name} {value} />
			{/each}
		</div>
	{/if}

	<div class="flex flex-col gap-2 sm:flex-row">
		<!-- No name: only the chosen values above are submitted. -->
		<Select
			{id}
			aria-invalid={invalid}
			disabled={available.length === 0}
			onchange={(event) => {
				const value = event.currentTarget.value;
				if (value) {
					chosen = [...chosen, value];
				}
				event.currentTarget.value = '';
			}}
		>
			<option value="" selected>{selectLabel}</option>
			{#each available as option (option)}
				<option value={option}>{option}</option>
			{/each}
		</Select>
		<Button type="button" variant="outline" onclick={oncreate}>
			<Plus />{createLabel}
		</Button>
	</div>
</div>

<script lang="ts">
	import { Plus, X } from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button';
	import type { AdminMeetPitch, MemberOption } from '$lib/dto/admin';
	import Select from './select.svelte';
	import SuggestInput from './suggest-input.svelte';

	let {
		pitches,
		members,
		bookTitles,
		authorNames,
		errors
	}: {
		/** The rows to start with. */
		pitches: Array<AdminMeetPitch>;
		members: Array<MemberOption>;
		bookTitles: Array<string>;
		authorNames: Array<string>;
		errors?: Array<string>;
	} = $props();

	type Row = { key: number; title: string; author: string; pitchedBy: string; elected: boolean };

	let nextKey = 0;
	const toRow = (pitch?: AdminMeetPitch): Row => ({
		key: nextKey++,
		title: pitch?.title ?? '',
		author: pitch?.author ?? '',
		pitchedBy: pitch?.pitchedBy?.toString() ?? '',
		elected: pitch?.status === 'elected'
	});

	// Starts from `pitches`; after that the user's changes are the state.
	let rows = $state(pitches.map((p) => toRow(p)));

	function elect(key: number) {
		for (const row of rows) {
			row.elected = row.key === key && !row.elected;
		}
	}
</script>

<!--
	Every row submits its title, author, pitcher and status, in row order; see `pitchFields` in
	$lib/server/admin/schemas.
-->
<div class="flex flex-col gap-3">
	{#if rows.length > 0}
		<div
			class="text-muted-foreground hidden gap-2 text-xs font-medium sm:grid sm:grid-cols-[2fr_2fr_1.5fr_auto_auto]"
		>
			<span>Tittel</span>
			<span>Forfatter</span>
			<span>Pitchet av</span>
			<span>Valgt</span>
			<span class="w-9"></span>
		</div>
	{/if}

	{#each rows as row, i (row.key)}
		<div
			class="grid grid-cols-[1fr_auto] gap-2 border-b pb-3 sm:grid-cols-[2fr_2fr_1.5fr_auto_auto] sm:items-center sm:border-0 sm:pb-0"
		>
			<SuggestInput
				id={`pitch-title-${row.key}`}
				name="pitchTitles"
				bind:value={row.title}
				suggestions={bookTitles}
				createLabel="Ny bok"
				placeholder="Tittel"
				class="col-span-2 sm:col-span-1"
			/>
			<SuggestInput
				id={`pitch-author-${row.key}`}
				name="pitchAuthors"
				bind:value={row.author}
				suggestions={authorNames}
				createLabel="Ny forfatter"
				placeholder="Forfatter (valgfritt)"
				class="col-span-2 sm:col-span-1"
			/>
			<Select name="pitchedBy" bind:value={row.pitchedBy} aria-label="Pitchet av">
				<option value="">Pitchet av…</option>
				{#each members as member (member.id)}
					<option value={member.id.toString()}>{member.name}</option>
				{/each}
			</Select>

			<label class="flex items-center gap-2 text-sm sm:justify-center">
				<input
					type="checkbox"
					checked={row.elected}
					onchange={() => elect(row.key)}
					class="accent-primary size-4"
				/>
				<span class="sm:sr-only">Valgt</span>
			</label>
			<input type="hidden" name="pitchStatuses" value={row.elected ? 'elected' : 'pitched'} />

			<Button
				type="button"
				variant="ghost"
				size="icon"
				class="col-start-2 row-start-3 sm:col-start-auto sm:row-start-auto"
				aria-label={`Fjern pitch ${i + 1}`}
				onclick={() => (rows = rows.filter((r) => r.key !== row.key))}
			>
				<X />
			</Button>
		</div>
	{/each}

	{#if errors?.length}
		<p class="text-destructive text-sm">{errors.join(' ')}</p>
	{/if}

	<div>
		<Button type="button" variant="outline" onclick={() => rows.push(toRow())}>
			<Plus />Legg til pitch
		</Button>
	</div>
</div>

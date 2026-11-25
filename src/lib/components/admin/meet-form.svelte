<script lang="ts">
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import type { AdminElectedBook, AdminFormState, AdminMeet, MemberOption } from '$lib/dto/admin';
	import { AdminRoutes } from '$lib/routes';
	import BookFields from './book-fields.svelte';
	import FormField from './form-field.svelte';
	import NewAuthorSheet from './new-author-sheet.svelte';
	import { fieldValue, fieldValues, osloDateTimeInput } from './form-values';
	import PitchRows from './pitch-rows.svelte';
	import Select from './select.svelte';
	import Textarea from './textarea.svelte';

	let {
		meet,
		members,
		genres,
		languages,
		authorNames,
		bookTitles,
		electedBooks,
		form
	}: {
		/** null when creating a new meet. */
		meet: AdminMeet | null;
		members: Array<MemberOption>;
		/** Genres already in use, suggested in the genre field. */
		genres: Array<string>;
		/** Original languages already in use, suggested in the language field. */
		languages: Array<string>;
		/** Existing authors, suggested in the authors field. */
		authorNames: Array<string>;
		/** Existing books, suggested in the pitch rows. */
		bookTitles: Array<string>;
		/** Elected books not read yet, offered for a meet without a book. */
		electedBooks: Array<AdminElectedBook>;
		form: AdminFormState | null | undefined;
	} = $props();

	let pending = $state(false);

	const value = (name: string, saved: string) => fieldValue(form, name, saved);
	const errors = $derived(form?.errors ?? {});
	const hostId = $derived(value('hostId', meet?.hostId?.toString() ?? ''));

	// A meet without a book can take an existing one, usually the book elected last time. The
	// most recent election is chosen by default; "Ny bok" (null) creates a new book instead.
	const dateFmt = new Intl.DateTimeFormat('nb-NO', {
		dateStyle: 'medium',
		timeZone: 'Europe/Oslo'
	});
	const canChoose = $derived(!meet?.book && electedBooks.length > 0);
	const initialChoice = form
		? fieldValue(form, 'bookId', '')
		: meet?.book
			? ''
			: (electedBooks[0]?.id.toString() ?? '');
	let bookChoice = $state(initialChoice);
	const chosenBook = $derived(electedBooks.find((b) => b.id.toString() === bookChoice) ?? null);
	const book = $derived(meet?.book ?? chosenBook);
	const attendees = $derived(fieldValues(form, 'attendees', meet?.attendeeIds.map(String) ?? []));

	// Authors created in the side panel join the options and are chosen for the book.
	let authorOptions = $state([...authorNames]);
	let chosenAuthors = $state(
		fieldValues(
			form,
			'bookAuthors',
			(meet?.book ?? electedBooks.find((b) => b.id.toString() === initialChoice))?.authors ?? []
		)
	);
	let authorSheetOpen = $state(false);

	function chooseBook(event: Event & { currentTarget: HTMLSelectElement }) {
		const choice = event.currentTarget.value;
		chosenAuthors = electedBooks.find((b) => b.id.toString() === choice)?.authors ?? [];
	}

	function authorCreated(name: string) {
		authorOptions = [...authorOptions, name].sort((a, b) => a.localeCompare(b, 'nb-NO'));
		chosenAuthors = [...chosenAuthors, name];
	}
</script>

<form
	method="POST"
	action={meet ? '?/update' : '?/create'}
	class="flex flex-col gap-4"
	use:enhance={() => {
		pending = true;
		return async ({ result, update }) => {
			pending = false;
			if (result.type === 'redirect') {
				toast.success('Lagret');
			}
			await update({ reset: false });
		};
	}}
>
	<div class="grid gap-4 sm:grid-cols-2">
		<FormField label="Tidspunkt" id="startsAt" errors={errors.startsAt}>
			<Input
				id="startsAt"
				name="startsAt"
				type="datetime-local"
				required
				value={value('startsAt', osloDateTimeInput(meet?.startsAt))}
				aria-invalid={!!errors.startsAt}
			/>
		</FormField>

		<FormField label="Vert" id="hostId" errors={errors.hostId}>
			<Select id="hostId" name="hostId" aria-invalid={!!errors.hostId}>
				<option value="" selected={hostId === ''}>Ingen</option>
				{#each members as member (member.id)}
					<option value={member.id} selected={hostId === member.id.toString()}>
						{member.name}
					</option>
				{/each}
			</Select>
		</FormField>
	</div>

	<div class="grid gap-4 sm:grid-cols-2">
		<FormField label="Sted" id="location" errors={errors.location} hint="F.eks. «Hos Ola».">
			<Input
				id="location"
				name="location"
				value={value('location', meet?.location ?? '')}
				aria-invalid={!!errors.location}
			/>
		</FormField>

		<FormField label="Adresse" id="address" errors={errors.address}>
			<Input
				id="address"
				name="address"
				value={value('address', meet?.address ?? '')}
				aria-invalid={!!errors.address}
			/>
		</FormField>
	</div>

	<FormField label="Notater" id="notes" errors={errors.notes}>
		<Textarea
			id="notes"
			name="notes"
			rows={4}
			value={value('notes', meet?.notes ?? '')}
			aria-invalid={!!errors.notes}
		/>
	</FormField>

	<!-- The border sits on a wrapper: a fieldset draws its legend on top of its own top border. -->
	<div class="mt-4 border-t pt-6">
		<fieldset class="flex flex-col gap-4">
			<legend class="mb-1 text-lg font-semibold">Bok</legend>
			<p class="text-muted-foreground text-sm">
				{#if meet?.book}
					Boken som leses på dette møtet. Endringer her oppdaterer boken.
				{:else if chosenBook}
					Den valgte boken. Fyll inn det som mangler; endringene lagres på boken.
				{:else}
					Boken som skal leses. Den opprettes når møtet lagres. La tittelen stå tom for å legge til
					bok senere.
				{/if}
			</p>

			{#if canChoose}
				<FormField label="Hvilken bok?" id="bookChoice">
					<Select id="bookChoice" bind:value={bookChoice} onchange={chooseBook}>
						{#each electedBooks as elected (elected.id)}
							<option value={elected.id.toString()}>
								{elected.title} (valgt {dateFmt.format(elected.electedAt)})
							</option>
						{/each}
						<option value="">Ny bok</option>
					</Select>
				</FormField>
			{/if}
			{#if !meet?.book && chosenBook}
				<input type="hidden" name="bookId" value={chosenBook.id} />
			{/if}

			{#key bookChoice}
				<BookFields
					{book}
					{form}
					{genres}
					{languages}
					{authorOptions}
					bind:chosenAuthors
					onnewauthor={() => (authorSheetOpen = true)}
					titleRequired={!!book}
				/>
			{/key}
		</fieldset>
	</div>

	<!-- Only when editing: there is nothing to record before the meet exists. -->
	{#if meet}
		<div class="mt-4 border-t pt-6">
			<fieldset class="flex flex-col gap-4">
				<legend class="mb-1 text-lg font-semibold">Etter møtet</legend>
				<p class="text-muted-foreground text-sm">Fylles ut når møtet er holdt.</p>

				<FormField label="Høydepunkter" id="highlights" errors={errors.highlights}>
					<Textarea
						id="highlights"
						name="highlights"
						rows={4}
						value={value('highlights', meet?.highlights ?? '')}
						aria-invalid={!!errors.highlights}
					/>
				</FormField>

				<fieldset class="flex flex-col gap-2">
					<legend class="mb-2 text-sm font-medium">Oppmøte</legend>
					<div class="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3">
						{#each members as member (member.id)}
							<label class="flex items-center gap-2 text-sm">
								<input
									type="checkbox"
									name="attendees"
									value={member.id}
									checked={attendees.includes(member.id.toString())}
									class="accent-primary size-4"
								/>
								{member.name}
							</label>
						{/each}
					</div>
					{#if errors.attendees}
						<p class="text-destructive text-sm">{errors.attendees.join(' ')}</p>
					{/if}
				</fieldset>

				<fieldset class="flex flex-col gap-2">
					<legend class="mb-1 text-sm font-medium">Pitcher</legend>
					<p class="text-muted-foreground mb-2 text-sm">
						Bøkene som ble pitchet, og hvilken som ble valgt. Nye bøker og forfattere opprettes med
						bare navnet; resten fylles inn når boken skal leses.
					</p>
					<PitchRows
						pitches={meet.pitches}
						{members}
						{bookTitles}
						authorNames={authorOptions}
						errors={errors.pitches}
					/>
				</fieldset>
			</fieldset>
		</div>
	{/if}

	{#if errors.form}
		<p class="text-destructive text-sm">{errors.form.join(' ')}</p>
	{/if}

	<div class="flex gap-2">
		<Button type="submit" disabled={pending}>{pending ? 'Lagrer…' : 'Lagre'}</Button>
		<Button variant="outline" href={AdminRoutes.MEETS}>Avbryt</Button>
	</div>
</form>

<!-- Outside the meet form: the panel has a form of its own. -->
<NewAuthorSheet bind:open={authorSheetOpen} oncreated={authorCreated} />

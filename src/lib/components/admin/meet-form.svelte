<script lang="ts">
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import type { AdminFormState, AdminMeet, MemberOption } from '$lib/dto/admin';
	import { AdminRoutes } from '$lib/routes';
	import FormField from './form-field.svelte';
	import NewAuthorSheet from './new-author-sheet.svelte';
	import { fieldValue, fieldValues, osloDateTimeInput } from './form-values';
	import PickOrCreate from './pick-or-create.svelte';
	import Select from './select.svelte';
	import SuggestInput from './suggest-input.svelte';
	import TagInput from './tag-input.svelte';
	import Textarea from './textarea.svelte';

	let {
		meet,
		members,
		genres,
		languages,
		authorNames,
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
		form: AdminFormState | null | undefined;
	} = $props();

	let pending = $state(false);

	const value = (name: string, saved: string) => fieldValue(form, name, saved);
	const errors = $derived(form?.errors ?? {});
	const hostId = $derived(value('hostId', meet?.hostId?.toString() ?? ''));
	const book = $derived(meet?.book ?? null);

	// Authors created in the side panel join the options and are chosen for the book.
	let authorOptions = $state([...authorNames]);
	let chosenAuthors = $state(fieldValues(form, 'bookAuthors', meet?.book?.authors ?? []));
	let authorSheetOpen = $state(false);

	function authorCreated(name: string) {
		authorOptions = [...authorOptions, name].sort((a, b) => a.localeCompare(b, 'nb-NO'));
		chosenAuthors = [...chosenAuthors, name];
	}
</script>

<form
	method="POST"
	action="?/save"
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
				{book
					? 'Boken som leses på dette møtet. Endringer her oppdaterer boken.'
					: 'Boken som skal leses. Den opprettes når møtet lagres. La tittelen stå tom for å legge til bok senere.'}
			</p>

			<FormField label="Tittel" id="bookTitle" errors={errors.bookTitle}>
				<Input
					id="bookTitle"
					name="bookTitle"
					required={!!book}
					value={value('bookTitle', book?.title ?? '')}
					aria-invalid={!!errors.bookTitle}
				/>
			</FormField>

			<FormField
				label="Forfattere"
				id="bookAuthors"
				errors={errors.bookAuthors}
				hint="Velg en eksisterende forfatter, eller legg til en ny."
			>
				<PickOrCreate
					id="bookAuthors"
					name="bookAuthors"
					bind:chosen={chosenAuthors}
					options={authorOptions}
					selectLabel="Velg forfatter…"
					createLabel="Legg til ny forfatter"
					oncreate={() => (authorSheetOpen = true)}
					invalid={!!errors.bookAuthors}
				/>
			</FormField>

			<div class="grid gap-4 sm:grid-cols-3">
				<FormField label="ISBN" id="bookIsbn" errors={errors.bookIsbn}>
					<Input
						id="bookIsbn"
						name="bookIsbn"
						inputmode="numeric"
						value={value('bookIsbn', book?.isbn ?? '')}
						aria-invalid={!!errors.bookIsbn}
					/>
				</FormField>
				<FormField label="Sider" id="bookPages" errors={errors.bookPages}>
					<Input
						id="bookPages"
						name="bookPages"
						type="number"
						min="1"
						value={value('bookPages', book?.pages?.toString() ?? '')}
						aria-invalid={!!errors.bookPages}
					/>
				</FormField>
				<FormField
					label="Første utgivelse"
					id="bookFirstPublished"
					errors={errors.bookFirstPublished}
				>
					<Input
						id="bookFirstPublished"
						name="bookFirstPublished"
						type="number"
						placeholder="År"
						value={value('bookFirstPublished', book?.firstPublished?.toString() ?? '')}
						aria-invalid={!!errors.bookFirstPublished}
					/>
				</FormField>
			</div>

			<div class="grid gap-4 sm:grid-cols-2">
				<FormField
					label="Sjangre"
					id="bookGenres"
					errors={errors.bookGenres}
					hint="Velg fra listen, eller skriv og velg «Ny sjanger»."
				>
					<TagInput
						id="bookGenres"
						name="bookGenres"
						values={fieldValues(form, 'bookGenres', book?.genres ?? [])}
						suggestions={genres}
						createLabel="Ny sjanger"
						invalid={!!errors.bookGenres}
					/>
				</FormField>
				<FormField
					label="Originalspråk"
					id="bookOriginalLanguage"
					errors={errors.bookOriginalLanguage}
					hint="Velg fra listen, eller skriv et nytt."
				>
					<SuggestInput
						id="bookOriginalLanguage"
						name="bookOriginalLanguage"
						value={value('bookOriginalLanguage', book?.originalLanguage ?? '')}
						suggestions={languages}
						createLabel="Nytt språk"
						invalid={!!errors.bookOriginalLanguage}
					/>
				</FormField>
			</div>

			<FormField label="Beskrivelse" id="bookDescription" errors={errors.bookDescription}>
				<Textarea
					id="bookDescription"
					name="bookDescription"
					rows={5}
					value={value('bookDescription', book?.description ?? '')}
					aria-invalid={!!errors.bookDescription}
				/>
			</FormField>
		</fieldset>
	</div>

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

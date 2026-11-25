<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import type { AdminFormState, AdminMeetBook } from '$lib/dto/admin';
	import FormField from './form-field.svelte';
	import { fieldValue, fieldValues } from './form-values';
	import PickOrCreate from './pick-or-create.svelte';
	import SuggestInput from './suggest-input.svelte';
	import TagInput from './tag-input.svelte';
	import Textarea from './textarea.svelte';

	/**
	 * A book's fields, without the surrounding form: used in the meet form and on the book page.
	 * Field names are prefixed `book` (see `bookFields` in $lib/server/admin/schemas). Genres and
	 * language keep their own state, so wrap in `{#key}` to start over with another book.
	 */
	let {
		book,
		form,
		genres,
		languages,
		authorOptions,
		chosenAuthors = $bindable([]),
		onnewauthor,
		titleRequired = false
	}: {
		/** null for a new book. */
		book: Omit<AdminMeetBook, 'id' | 'authors'> | null;
		form: AdminFormState | null | undefined;
		/** Genres already in use, suggested in the genre field. */
		genres: Array<string>;
		/** Original languages already in use, suggested in the language field. */
		languages: Array<string>;
		/** Existing authors, in the authors dropdown. */
		authorOptions: Array<string>;
		chosenAuthors?: Array<string>;
		/** "Legg til ny forfatter" was clicked; open the new author panel. */
		onnewauthor: () => void;
		titleRequired?: boolean;
	} = $props();

	const value = (name: string, saved: string) => fieldValue(form, name, saved);
	const errors = $derived(form?.errors ?? {});
</script>

<FormField label="Tittel" id="bookTitle" errors={errors.bookTitle}>
	<Input
		id="bookTitle"
		name="bookTitle"
		required={titleRequired}
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
		oncreate={onnewauthor}
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
	<FormField label="Første utgivelse" id="bookFirstPublished" errors={errors.bookFirstPublished}>
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

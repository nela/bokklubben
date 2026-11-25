<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import type { AdminAuthor, AdminFormState, FieldErrors } from '$lib/dto/admin';
	import FormField from './form-field.svelte';
	import { dateInput, fieldValue } from './form-values';
	import Textarea from './textarea.svelte';

	/**
	 * An author's fields, without the surrounding form: in the "Ny forfatter" panel and on the
	 * author page. Names match `authorSchema`.
	 */
	let {
		idPrefix,
		author = null,
		form = null,
		errors
	}: {
		/** Keeps ids unique when the fields appear next to another form. */
		idPrefix: string;
		/** The saved author, when editing one. */
		author?: Omit<AdminAuthor, 'id' | 'books'> | null;
		/** A failed save, to show what was typed (and its errors, unless `errors` is given). */
		form?: AdminFormState | null;
		errors?: FieldErrors;
	} = $props();

	const id = (field: string) => `${idPrefix}-${field}`;
	const shown = $derived(errors ?? form?.errors ?? {});
	const value = (name: string, saved: string) => fieldValue(form, name, saved);
</script>

<div class="flex flex-col gap-4">
	<FormField label="Navn" id={id('name')} errors={shown.name}>
		<Input
			id={id('name')}
			name="name"
			required
			value={value('name', author?.name ?? '')}
			aria-invalid={!!shown.name}
		/>
	</FormField>

	<div class="grid grid-cols-2 gap-4">
		<FormField label="Født" id={id('born')} errors={shown.born}>
			<Input
				id={id('born')}
				name="born"
				type="date"
				value={value('born', dateInput(author?.born))}
				aria-invalid={!!shown.born}
			/>
		</FormField>
		<FormField label="Død" id={id('died')} errors={shown.died}>
			<Input
				id={id('died')}
				name="died"
				type="date"
				value={value('died', dateInput(author?.died))}
				aria-invalid={!!shown.died}
			/>
		</FormField>
	</div>

	<FormField label="Biografi" id={id('bio')} errors={shown.bio}>
		<Textarea
			id={id('bio')}
			name="bio"
			rows={6}
			value={value('bio', author?.bio ?? '')}
			aria-invalid={!!shown.bio}
		/>
	</FormField>

	<FormField
		label="Priser"
		id={id('awards')}
		errors={shown.awards}
		hint="Skill med semikolon (;)."
	>
		<Input
			id={id('awards')}
			name="awards"
			value={value('awards', author?.awards.join('; ') ?? '')}
			aria-invalid={!!shown.awards}
		/>
	</FormField>
</div>

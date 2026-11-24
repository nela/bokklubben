<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import type { FieldErrors } from '$lib/dto/admin';
	import FormField from './form-field.svelte';
	import Textarea from './textarea.svelte';

	/** An author's fields, without the surrounding form. Names match `authorSchema`. */
	let {
		idPrefix,
		errors = {}
	}: {
		/** Keeps ids unique when the fields appear next to another form. */
		idPrefix: string;
		errors?: FieldErrors;
	} = $props();

	const id = (field: string) => `${idPrefix}-${field}`;
</script>

<div class="flex flex-col gap-4">
	<FormField label="Navn" id={id('name')} errors={errors.name}>
		<Input id={id('name')} name="name" required aria-invalid={!!errors.name} />
	</FormField>

	<div class="grid grid-cols-2 gap-4">
		<FormField label="Født" id={id('born')} errors={errors.born}>
			<Input id={id('born')} name="born" type="date" aria-invalid={!!errors.born} />
		</FormField>
		<FormField label="Død" id={id('died')} errors={errors.died}>
			<Input id={id('died')} name="died" type="date" aria-invalid={!!errors.died} />
		</FormField>
	</div>

	<FormField label="Biografi" id={id('bio')} errors={errors.bio}>
		<Textarea id={id('bio')} name="bio" rows={6} aria-invalid={!!errors.bio} />
	</FormField>

	<FormField
		label="Priser"
		id={id('awards')}
		errors={errors.awards}
		hint="Skill med semikolon (;)."
	>
		<Input id={id('awards')} name="awards" aria-invalid={!!errors.awards} />
	</FormField>
</div>

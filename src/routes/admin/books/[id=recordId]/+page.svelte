<script lang="ts">
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import BookFields from '$lib/components/admin/book-fields.svelte';
	import DeleteForm from '$lib/components/admin/delete-form.svelte';
	import FormField from '$lib/components/admin/form-field.svelte';
	import { failedForm, fieldValue, fieldValues } from '$lib/components/admin/form-values';
	import NewAuthorSheet from '$lib/components/admin/new-author-sheet.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { AdminRoutes } from '$lib/routes';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	const failed = $derived(failedForm(form));
	const errors = $derived(failed?.errors ?? {});
	const value = (name: string, saved: string) => fieldValue(failed, name, saved);

	let pending = $state(false);

	// Authors created in the side panel join the options and are chosen for the book.
	let authorOptions = $state([...data.authorNames]);
	let chosenAuthors = $state(fieldValues(failedForm(form), 'bookAuthors', data.book.authors));
	let authorSheetOpen = $state(false);

	function authorCreated(name: string) {
		authorOptions = [...authorOptions, name].sort((a, b) => a.localeCompare(b, 'nb-NO'));
		chosenAuthors = [...chosenAuthors, name];
	}

	const dateFmt = new Intl.DateTimeFormat('nb-NO', {
		dateStyle: 'medium',
		timeZone: 'Europe/Oslo'
	});
	const statusLabel = { read: 'Lest', pitched: 'Pitchet', elected: 'Valgt' } as const;

	// Names the meets the book is on; deleting it removes it from them, the meets stay.
	const deleteMessage = $derived.by(() => {
		const { title, meets } = data.book;
		return meets.length === 0
			? `Slette ${title}? Ingen tilknytninger, trygt å slette.`
			: `Slette ${title}? Boken er tilknyttet møtene: ${meets.map((m) => dateFmt.format(m.startsAt)).join(', ')}.`;
	});
</script>

<h1 class="mb-6 text-2xl font-semibold">{data.book.title}</h1>

<form
	method="POST"
	action="?/update"
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
	<BookFields
		book={data.book}
		form={failed}
		genres={data.genres}
		languages={data.languages}
		{authorOptions}
		bind:chosenAuthors
		onnewauthor={() => (authorSheetOpen = true)}
		titleRequired
	/>

	<div class="grid gap-4 sm:grid-cols-3">
		<FormField
			label="Goodreads"
			id="bookRating"
			errors={errors.bookRating}
			hint="Snittkarakter, 0–5."
		>
			<Input
				id="bookRating"
				name="bookRating"
				type="number"
				min="0"
				max="5"
				step="0.01"
				value={value('bookRating', data.book.rating?.toString() ?? '')}
				aria-invalid={!!errors.bookRating}
			/>
		</FormField>
		<FormField
			label="Priser"
			id="bookAwards"
			errors={errors.bookAwards}
			hint="Skill med semikolon (;)."
			class="sm:col-span-2"
		>
			<Input
				id="bookAwards"
				name="bookAwards"
				value={value('bookAwards', data.book.awards.join('; '))}
				aria-invalid={!!errors.bookAwards}
			/>
		</FormField>
	</div>

	{#if errors.form}
		<p class="text-destructive text-sm">{errors.form.join(' ')}</p>
	{/if}

	<div class="flex gap-2">
		<Button type="submit" disabled={pending}>{pending ? 'Lagrer…' : 'Lagre'}</Button>
		<Button variant="outline" href={AdminRoutes.BOOKS}>Avbryt</Button>
	</div>
</form>

<section class="mt-8">
	<h2 class="mb-2 text-sm font-medium">Møter</h2>
	{#if data.book.meets.length > 0}
		<ul class="text-sm">
			{#each data.book.meets as meet (meet.id)}
				<li>
					<a href={`${AdminRoutes.MEETS}/${meet.id}`} class="hover:underline">
						{dateFmt.format(meet.startsAt)}
					</a>
					<span class="text-muted-foreground">– {statusLabel[meet.status]}</span>
				</li>
			{/each}
		</ul>
	{:else}
		<p class="text-muted-foreground text-sm">Ikke på noe møte.</p>
	{/if}
</section>

<div class="mt-10 border-t pt-6">
	<DeleteForm confirmMessage={deleteMessage} />
</div>

<!-- Outside the form above: the panel has a form of its own. -->
<NewAuthorSheet bind:open={authorSheetOpen} oncreated={authorCreated} />

<script lang="ts">
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import AuthorFields from '$lib/components/admin/author-fields.svelte';
	import DeleteForm from '$lib/components/admin/delete-form.svelte';
	import { failedForm } from '$lib/components/admin/form-values';
	import { Button } from '$lib/components/ui/button';
	import { AdminRoutes } from '$lib/routes';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	const failed = $derived(failedForm(form));
	const errors = $derived(failed?.errors ?? {});

	let pending = $state(false);

	const deleteMessage = $derived.by(() => {
		if (!data.author) {
			return '';
		}
		const { name, books } = data.author;
		return books.length === 0
			? `Slette ${name}? Ingen tilknytninger, trygt å slette.`
			: `Slette ${name}? Forfatteren er tilknyttet bøkene: ${books.map((b) => b.title).join(', ')}.`;
	});
</script>

<h1 class="mb-6 text-2xl font-semibold">{data.author?.name ?? 'Ny forfatter'}</h1>

<form
	method="POST"
	action={data.author ? '?/update' : '?/create'}
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
	<AuthorFields idPrefix="author" author={data.author} form={failed} />

	{#if errors.form}
		<p class="text-destructive text-sm">{errors.form.join(' ')}</p>
	{/if}

	<div class="flex gap-2">
		<Button type="submit" disabled={pending}>{pending ? 'Lagrer…' : 'Lagre'}</Button>
		<Button variant="outline" href={AdminRoutes.AUTHORS}>Avbryt</Button>
	</div>
</form>

{#if data.author}
	<section class="mt-8">
		<h2 class="mb-2 text-sm font-medium">Bøker</h2>
		{#if data.author.books.length > 0}
			<ul class="text-sm">
				{#each data.author.books as book (book.id)}
					<li>
						<a href={`${AdminRoutes.BOOKS}/${book.id}`} class="hover:underline">{book.title}</a>
					</li>
				{/each}
			</ul>
		{:else}
			<p class="text-muted-foreground text-sm">
				Ingen ennå. Forfattere knyttes til bøker på boken eller møtet.
			</p>
		{/if}
	</section>

	<div class="mt-10 border-t pt-6">
		<DeleteForm confirmMessage={deleteMessage} />
	</div>
{/if}

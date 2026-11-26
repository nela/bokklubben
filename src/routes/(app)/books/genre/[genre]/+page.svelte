<script lang="ts">
	import BookList from '$lib/components/book-list.svelte';
	import { createSlug } from '$lib/utils/helpers';
	import type { PageProps } from './$types';

	const { data, params }: PageProps = $props();
	const books = $derived(
		data.books.filter((b) => b.genres.some((g) => createSlug(g) === params.genre))
	);
</script>

<div class="mx-auto w-full max-w-[90rem] p-4 md:p-8">
	{#if books.length > 0}
		<BookList {books} />
	{:else}
		<div class="flex h-full items-center justify-center p-10">
			<p class="text-muted-foreground">Fant ingen bøker i denne sjangeren.</p>
		</div>
	{/if}
</div>

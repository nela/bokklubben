<script lang="ts">
	import BookList from '$lib/components/book-list.svelte';
	import type { PageProps } from './$types';

	const { data, params }: PageProps = $props();
	const books = $derived(data.books.filter((b) => b.read.getFullYear().toString() === params.year));
</script>

<div class="p-4">
	{#if books && books.length > 0}
		<BookList {books} />
	{:else}
		<div class="flex h-full items-center justify-center p-10">
			<p class="text-muted-foreground">Fant ingen bøker for året {params.year}.</p>
		</div>
	{/if}
</div>

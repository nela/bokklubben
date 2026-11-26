<script lang="ts">
	import BookList from '$lib/components/book-list.svelte';
	const { data } = $props();
	const { books } = data;
</script>

<div class="mx-auto w-full max-w-[90rem] p-4 md:p-8">
	{#if books && books.length > 0}
		<BookList {books} />
	{:else}
		<div class="flex h-full items-center justify-center p-10">
			<p class="text-muted-foreground">Fant ingen bøker. Kontakt support om feilmeldingen.</p>
		</div>
	{/if}
</div>

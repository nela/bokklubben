<script lang="ts">
	import BookCard from "./book-card.svelte";

	let { books }: { books: Array<Book> } = $props();
</script>

<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
	{#each books as book (book.title)}
		<BookCard {book} />
	{/each}
</div>

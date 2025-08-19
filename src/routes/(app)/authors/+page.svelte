<script lang="ts">
	import AuthorCard from '$lib/components/author-card.svelte';

	const { data } = $props();
	const { authors } = data;
</script>

<div class="p-4">
	{#if authors && authors.length > 0}
		<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
			{#each authors as author (author.name)}
				<AuthorCard {author} />
			{/each}
		</div>
	{:else}
		<div class="flex h-full items-center justify-center p-10">
			<p class="text-muted-foreground">No authors found.</p>
		</div>
	{/if}
</div>

<script lang="ts">
	import AuthorCard from '$lib/components/author-card.svelte';

	const { data } = $props();
	const { authors } = data;
</script>

<div class="mx-auto w-full max-w-[90rem] p-4 md:p-8">
	{#if authors && authors.length > 0}
		<div class="grid grid-cols-1 gap-4 xl:grid-cols-2">
			{#each authors as author (author.name)}
				<AuthorCard {author} detail="bio" />
			{/each}
		</div>
	{:else}
		<div class="flex h-full items-center justify-center p-10">
			<p class="text-muted-foreground">No authors found.</p>
		</div>
	{/if}
</div>

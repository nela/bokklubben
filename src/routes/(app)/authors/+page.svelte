<script lang="ts">
	import AuthorList from '$lib/components/author-list.svelte';

	const { data } = $props();
	const { authors } = data;
</script>

<div
	class="p-4"
>
	{#if authors && authors.length > 0}
		<AuthorList {authors} />
	{:else}
		<div class="flex h-full items-center justify-center p-10">
			<p class="text-muted-foreground">No authors found.</p>
		</div>
	{/if}
</div>


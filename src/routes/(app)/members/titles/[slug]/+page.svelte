<script lang="ts">
	import MemberList from '$lib/components/member-list.svelte';
	import type { PageProps } from './$types';

	const { data, params }: PageProps = $props();

	const titledMembers = $derived(
		data.allMembers.filter((m) => m.titles.some((t) => t.slug === params.slug))
	);
</script>

<div class="p-4">
	{#if titledMembers.length > 0}
		<MemberList members={titledMembers} layout="list" />
	{:else}
		<div class="flex h-full items-center justify-center p-10">
			<p class="text-muted-foreground">Ingen medlemmer har denne tittelen.</p>
		</div>
	{/if}
</div>

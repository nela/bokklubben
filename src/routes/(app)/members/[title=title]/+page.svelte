<script lang="ts">
	import MemberList from '$lib/components/member-list.svelte';
	import { ClubTitle } from '$lib/dto/dto';
	import type { PageProps } from './$types';

	const { data, params }: PageProps = $props();
	const { allMembers } = data;

	const titledMembers = $derived.by(() => {
		const searchTitle = params.title.toUpperCase() as ClubTitle;
		return allMembers.filter((m) => m.titles.includes(searchTitle));
	});
</script>

<div class="p-4">
	{#if titledMembers && titledMembers.length > 0}
		<MemberList members={titledMembers} layout="list" />
	{:else}
		<div class="flex h-full items-center justify-center p-10">
			<p class="text-muted-foreground">Ingen medlemmer funnet. Kontakt support.</p>
		</div>
	{/if}
</div>

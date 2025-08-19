<script lang="ts">
	import type { PublicMember } from '$lib/dto/dto';
	import MemberCard from './member-card.svelte';

	type Layout = 'grid' | 'list';

	const {
		members,
		layout = 'grid'
	}: {
		members: Array<PublicMember>;
		layout?: Layout;
	} = $props();

	// Determine container classes based on the layout prop
	const containerClasses =
		layout === 'grid'
			? 'grid grid-cols-1 gap-4 md:grid-cols-2'
			: 'flex flex-col gap-4';
</script>

<div class={containerClasses}>
	{#each members as member (member.firstname + member.lastname)}
		<MemberCard {member} />
	{/each}
</div>

<!-- Usage -->
<!-- <script lang="ts">
	import MembersList from '$lib/components/members/MembersList.svelte';
	import Button from '$lib/components/ui/button/button.svelte';

	const { data } = $props();
	const { allMembers } = data;

	let layout: 'grid' | 'list' = 'list';
</script>

<div class="space-y-4 p-4">
	<div class="flex gap-2">
		<Button variant={layout === 'list' ? 'default' : 'outline'} onclick={() => (layout = 'list')}>
			List
		</Button>
		<Button variant={layout === 'grid' ? 'default' : 'outline'} onclick={() => (layout = 'grid')}>
			Grid
		</Button>
	</div>

	{#if allMembers && allMembers.length > 0}
		<MembersList members={allMembers} {layout} />
	{:else}
		<div class="flex h-full items-center justify-center p-10">
			<p class="text-muted-foreground">No members found.</p>
		</div>
	{/if}
</div> -->

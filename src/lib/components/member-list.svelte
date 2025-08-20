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
		layout === 'grid' ? 'grid grid-cols-1 gap-4 md:grid-cols-2' : 'flex flex-col gap-4';
</script>

<div class={containerClasses}>
	{#each members as member (member.firstname + member.lastname)}
		<MemberCard {member} />
	{/each}
</div>

<script lang="ts">
	import MemberList from '$lib/components/member-list.svelte';
	const { data } = $props();
	const { allMembers } = data;
</script>

<div class="p-4">
	{#if allMembers && allMembers.length > 0}
		<MemberList members={allMembers} />
	{:else}
		<div class="flex h-full items-center justify-center p-10">
			<p class="text-muted-foreground">No members found.</p>
		</div>
	{/if}
</div>

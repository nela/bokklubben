<script lang="ts">
	import MemberList from '$lib/components/member-list.svelte';
	const { data } = $props();
	const { allMembers } = data;
</script>

<div class="mx-auto w-full max-w-[90rem] p-4 md:p-8">
	{#if allMembers && allMembers.length > 0}
		<MemberList members={allMembers} />
	{:else}
		<div class="flex h-full items-center justify-center p-10">
			<p class="text-muted-foreground">No members found.</p>
		</div>
	{/if}
</div>

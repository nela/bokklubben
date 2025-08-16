<script lang="ts">
	import type { PublicMember } from '$lib/dto/dto';
	import * as Avatar from '$lib/components/ui/avatar/index.js';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import { CalendarCheck2, Crown, User } from '@lucide/svelte';

	type Layout = 'grid' | 'list';

	const {
		members,
		layout = 'grid'
	}: {
		members: Array<PublicMember>;
		layout?: Layout;
	} = $props();

	const getDisplayName = (m: PublicMember) =>
		m.username ? `${m.firstname} '${m.username}' ${m.lastname}` : `${m.firstname} ${m.lastname}`;

	// Determine container classes based on the layout prop
	const containerClasses =
		layout === 'grid'
			? 'grid grid-cols-1 gap-4 md:grid-cols-2'
			: 'flex flex-col gap-4';
</script>

<div class={containerClasses}>
	{#each members as member (member.firstname + member.lastname)}
		{@const displayName = getDisplayName(member)}
		<Card.Root>
			<div class="flex items-center gap-6 p-4">
				<Avatar.Root class="h-32 w-32">
					<Avatar.Image src={member.imageUrl} alt={displayName} />
					<Avatar.Fallback>
						{member.firstname.charAt(0)}{member.lastname.charAt(0)}
					</Avatar.Fallback>
				</Avatar.Root>

				<div class="flex-1 space-y-4">
					<div>
						<div class="flex items-center gap-2">
							<User class="text-muted-foreground h-5 w-5" />
							<h3 class="text-lg font-semibold">{displayName}</h3>
						</div>
					</div>

					{#if member.titles && member.titles.length > 0}
						<div class="flex items-start gap-3">
							<Crown class="text-muted-foreground h-5 w-5 flex-shrink-0" />
							<div class="flex flex-wrap items-center gap-2">
								{#each member.titles as title}
									{@const href = '/members'}
									<Badge {href} variant="outline">{title}</Badge>
								{/each}
							</div>
						</div>
					{/if}
					<div class="text-muted-foreground flex items-center gap-3 text-sm">
						<CalendarCheck2 class="h-4 w-4 flex-shrink-0" />
						<div>
							<p>Since: {new Date(member.memberSince).toLocaleDateString()}</p>
							{#if member.memberTo}
								<p>Until: {new Date(member.memberTo).toLocaleDateString()}</p>
							{/if}
						</div>
					</div>
				</div>
			</div>
		</Card.Root>
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

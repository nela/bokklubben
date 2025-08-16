
<script lang="ts">
	import type { PublicMember } from '$lib/dto/dto';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import { CalendarCheck2, Crown, User } from 'lucide-svelte';

	const { member }: { member: PublicMember } = $props();

	const getDisplayName = (m: PublicMember) =>
		m.username ? `${m.firstname} '${m.username}' ${m.lastname}` : `${m.firstname} ${m.lastname}`;
</script>

<Card.Root class="w-full p-6">
	<div class="flex flex-col items-center gap-6 text-center md:flex-row md:items-start md:text-left">
		<img
			src={member.imageUrl}
			alt={getDisplayName(member)}
			class="aspect-square h-48 w-48 flex-shrink-0 rounded-lg object-cover shadow-md"
		/>

		<div class="flex-1 space-y-4">
			<div class="flex items-center justify-center gap-2 md:justify-start">
				<User class="text-muted-foreground h-6 w-6" />
				<h1 class="text-2 lxl font-bold">{getDisplayName(member)}</h1>
			</div>

			{#if member.titles && member.titles.length > 0}
				<div class="flex items-start justify-center gap-3 md:justify-start">
					<Crown class="text-muted-foreground h-5 w-5 flex-shrink-0" />
					<div class="flex flex-wrap justify-center gap-2 md:justify-start">
						{#each member.titles as title}
							<Badge variant="secondary">{title}</Badge>
						{/each}
					</div>
				</div>
			{/if}

			<div class="text-muted-foreground flex items-center justify-center gap-3 text-sm md:justify-start">
				<CalendarCheck2 class="h-4 w-4 flex-shrink-0" />
				<div>
					<p >Member since: {new Date(member.memberSince).toLocaleDateString()}</p>
					{#if member.memberTo}
						<p>Member until: {new Date(member.memberTo).toLocaleDatetString()}</p>
					{/if}
				</div>
			</div>
		</div>
	</div>
</Card.Root>

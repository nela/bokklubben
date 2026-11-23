<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import { ClubTitle, type PublicMember } from '$lib/dto/dto';
	import { CalendarCheck2, Crown, User } from '@lucide/svelte';
	import * as Avatar from '$lib/components/ui/avatar/index.js';
	import { Badge } from './ui/badge';
	let {
		member,
		className,
		variant = 'extended'
	}: {
		member: PublicMember;
		className?: string;
		variant?: 'extended' | 'short';
	} = $props();

	const displayName = $derived(
		member.nickname
			? `${member.firstName} ${member.nickname} ${member.lastName}`
			: `${member.firstName} ${member.lastName}`
	);
</script>

<Card.Root class={className}>
	<div class="flex items-center gap-6 p-4">
		<Avatar.Root class="h-32 w-32">
			<Avatar.Image src={member.imageUrl} alt={displayName} />
			<Avatar.Fallback>
				{member.firstName.charAt(0)}{member.lastName.charAt(0)}
			</Avatar.Fallback>
		</Avatar.Root>

		<div class="flex-1 space-y-4">
			<Card.Title>
				{displayName}
			</Card.Title>

			{#if member.titles && member.titles.length > 0}
				<div class="flex items-start gap-3">
					<Crown class="text-muted-foreground h-5 w-5 flex-shrink-0" />
					<div class="flex flex-wrap items-center gap-2">
						{#each member.titles as title}
							{@const href = '/members'}
							<Badge {href} variant="outline">{ClubTitle[title]}</Badge>
						{/each}
					</div>
				</div>
			{/if}
			{#if variant === 'extended'}
				<div class="text-muted-foreground flex items-center gap-3 text-sm">
					<CalendarCheck2 class="h-4 w-4 flex-shrink-0" />
					<div>
						<p>Medlem siden: {new Date(member.memberSince).getFullYear()}</p>
						{#if member.memberUntil}
							<p>Medlem til: {new Date(member.memberUntil).toLocaleDateString()}</p>
						{/if}
					</div>
				</div>
			{/if}
		</div>
	</div>
</Card.Root>

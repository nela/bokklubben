<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import type { PublicMember } from '$lib/dto/dto';
	import { Routes } from '$lib/routes';
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

	const fullName = $derived(`${member.firstName} ${member.lastName}`);
	const hasTitles = $derived(member.titles && member.titles.length > 0);
</script>

<!-- On phones the photo sits beside the name, with titles and dates below. From md, the big photo
     sits to the left of everything, which is centred against it by the empty rows above and below. -->
<Card.Root class={className}>
	<div
		class="grid grid-cols-[5rem_minmax(0,1fr)] gap-x-4 p-4 [grid-template-areas:'photo_header'_'details_details'] md:grid-cols-[8rem_minmax(0,1fr)] md:grid-rows-[1fr_auto_auto_1fr] md:gap-x-6 md:[grid-template-areas:'photo_.'_'photo_header'_'photo_details'_'photo_.']"
	>
		<Avatar.Root class="size-20 self-center [grid-area:photo] md:size-32">
			<Avatar.Image src={member.imageUrl} alt={fullName} />
			<Avatar.Fallback>
				{member.firstName.charAt(0)}{member.lastName.charAt(0)}
			</Avatar.Fallback>
		</Avatar.Root>

		<div class="flex flex-col gap-1.5 self-center [grid-area:header]">
			<!-- The nickname is the headline, styled like the logo; the real name sits under it. -->
			<Card.Title
				class="font-unbounded w-fit bg-gradient-to-br from-zinc-900 to-zinc-600 bg-clip-text text-lg leading-snug font-semibold text-transparent drop-shadow-sm md:text-xl dark:from-zinc-200 dark:to-zinc-400"
			>
				{member.nickname || fullName}
			</Card.Title>
			{#if member.nickname}
				<p class="text-muted-foreground text-sm">{fullName}</p>
			{/if}
		</div>

		{#if hasTitles || variant === 'extended'}
			<div class="mt-4 flex flex-col gap-3 [grid-area:details] md:gap-4">
				{#if hasTitles}
					<div class="flex items-start gap-3">
						<Crown class="text-muted-foreground h-5 w-5 flex-shrink-0" />
						<div class="flex flex-wrap items-center gap-2">
							{#each member.titles as title (title.slug)}
								<Badge href={`${Routes.MEMBER_TITLES}/${title.slug}`} variant="outline">
									{title.name}
								</Badge>
							{/each}
						</div>
					</div>
				{/if}
				{#if variant === 'extended'}
					<div class="text-muted-foreground flex items-center gap-3 text-sm">
						<CalendarCheck2 class="h-4 w-4 flex-shrink-0" />
						<div>
							<p>Medlem siden {new Date(member.memberSince).getFullYear()}</p>
							{#if member.memberUntil}
								<p>Medlem til {new Date(member.memberUntil).toLocaleDateString()}</p>
							{/if}
						</div>
					</div>
				{/if}
			</div>
		{/if}
	</div>
</Card.Root>

<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import { ClubTitle } from '$lib/dto/dto';
	import { AdminRoutes } from '$lib/routes';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const signedUpCount = $derived(data.members.filter((m) => m.signedUp).length);
</script>

<h1 class="mb-2 text-2xl font-semibold">Medlemmer</h1>
<p class="text-muted-foreground mb-6 text-sm">
	{signedUpCount} av {data.members.length} har registrert seg.
</p>

{#if data.members.length > 0}
	<table class="w-full text-left text-sm">
		<thead class="text-muted-foreground border-b">
			<tr>
				<th class="py-2 pr-4 font-medium">Navn</th>
				<th class="hidden py-2 pr-4 font-medium md:table-cell">E-post</th>
				<th class="hidden py-2 pr-4 font-medium sm:table-cell">Titler</th>
				<th class="py-2 text-right font-medium">Medlem siden</th>
			</tr>
		</thead>
		<tbody>
			{#each data.members as member (member.id)}
				<tr class={['border-b align-top last:border-0', member.former && 'text-muted-foreground']}>
					<td class="py-2 pr-4">
						<div class="flex flex-wrap items-center gap-1.5">
							<a href={`${AdminRoutes.MEMBERS}/${member.id}`} class="hover:underline">
								{member.firstName}
								{#if member.nickname}<span class="text-muted-foreground">«{member.nickname}»</span
									>{/if}
								{member.lastName}
							</a>
							{#if !member.signedUp}
								<Badge
									variant="outline"
									class="border-amber-500/50 text-amber-600 dark:text-amber-400"
								>
									Ikke registrert
								</Badge>
							{/if}
							{#if member.role === 'admin'}
								<Badge variant="secondary">Admin</Badge>
							{/if}
							{#if member.former}
								<Badge variant="outline">Tidligere</Badge>
							{/if}
						</div>
					</td>
					<td class="hidden py-2 pr-4 md:table-cell">{member.email}</td>
					<td class="hidden py-2 pr-4 sm:table-cell">
						{member.titles.map((t) => ClubTitle[t]).join(', ') || '–'}
					</td>
					<td class="py-2 text-right tabular-nums">{member.memberSince.getFullYear()}</td>
				</tr>
			{/each}
		</tbody>
	</table>
{:else}
	<p class="text-muted-foreground">Ingen medlemmer ennå.</p>
{/if}

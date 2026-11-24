<script lang="ts">
	import { Plus } from '@lucide/svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { AdminRoutes } from '$lib/routes';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const dateFmt = new Intl.DateTimeFormat('nb-NO', {
		dateStyle: 'medium',
		timeStyle: 'short',
		timeZone: 'Europe/Oslo'
	});
	const now = new Date();
</script>

<div class="mb-6 flex items-center justify-between gap-4">
	<h1 class="text-2xl font-semibold">Møter</h1>
	<Button href={`${AdminRoutes.MEETS}/new`}><Plus />Nytt møte</Button>
</div>

{#if data.meets.length > 0}
	<table class="w-full text-left text-sm">
		<thead class="text-muted-foreground border-b">
			<tr>
				<th class="py-2 pr-4 font-medium">Dato</th>
				<th class="py-2 pr-4 font-medium">Bok</th>
				<th class="hidden py-2 font-medium sm:table-cell">Vert</th>
			</tr>
		</thead>
		<tbody>
			{#each data.meets as meet (meet.id)}
				<tr class="border-b align-top last:border-0">
					<td class="py-2 pr-4 whitespace-nowrap">
						<a href={`${AdminRoutes.MEETS}/${meet.id}`} class="hover:underline">
							{dateFmt.format(meet.startsAt)}
						</a>
						{#if meet.startsAt > now}
							<Badge variant="secondary" class="ml-1">Kommende</Badge>
						{/if}
					</td>
					<td class="py-2 pr-4">{meet.books.join(', ') || '–'}</td>
					<td class="text-muted-foreground hidden py-2 sm:table-cell">{meet.host ?? '–'}</td>
				</tr>
			{/each}
		</tbody>
	</table>
{:else}
	<p class="text-muted-foreground">Ingen møter ennå.</p>
{/if}

<script lang="ts">
	import { Plus } from '@lucide/svelte';
	import WarningBadge from '$lib/components/admin/warning-badge.svelte';
	import { Button } from '$lib/components/ui/button';
	import { AdminRoutes } from '$lib/routes';
	import { getLifetime } from '$lib/utils/helpers';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<div class="mb-6 flex items-center justify-between gap-4">
	<h1 class="text-2xl font-semibold">Forfattere</h1>
	<Button href={`${AdminRoutes.AUTHORS}/new`}><Plus />Ny forfatter</Button>
</div>

{#if data.authors.length > 0}
	<table class="w-full text-left text-sm">
		<thead class="text-muted-foreground border-b">
			<tr>
				<th class="py-2 pr-4 font-medium">Navn</th>
				<th class="py-2 pr-4 font-medium">Levetid</th>
				<th class="py-2 text-right font-medium">Bøker</th>
			</tr>
		</thead>
		<tbody>
			{#each data.authors as author (author.id)}
				<tr class="border-b last:border-0">
					<td class="py-2 pr-4">
						<div class="flex flex-wrap items-center gap-1.5">
							<a href={`${AdminRoutes.AUTHORS}/${author.id}`} class="hover:underline">
								{author.name}
							</a>
							{#if !author.hasReadBook}
								<WarningBadge title="Vises ikke på siden før en av bøkene er lest">
									Ingen lest bok
								</WarningBadge>
							{/if}
						</div>
					</td>
					<td class="text-muted-foreground py-2 pr-4">{getLifetime(author) ?? '–'}</td>
					<td class="py-2 text-right tabular-nums">{author.bookCount}</td>
				</tr>
			{/each}
		</tbody>
	</table>
{:else}
	<p class="text-muted-foreground">Ingen forfattere ennå.</p>
{/if}

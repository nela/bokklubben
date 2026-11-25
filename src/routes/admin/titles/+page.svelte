<script lang="ts">
	import { Plus } from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button';
	import { AdminRoutes } from '$lib/routes';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<div class="mb-6 flex items-center justify-between gap-4">
	<h1 class="text-2xl font-semibold">Titler</h1>
	<Button href={`${AdminRoutes.TITLES}/new`}><Plus />Ny tittel</Button>
</div>

{#if data.titles.length > 0}
	<table class="w-full text-left text-sm">
		<thead class="text-muted-foreground border-b">
			<tr>
				<th class="py-2 pr-4 font-medium">Navn</th>
				<th class="py-2 text-right font-medium">Medlemmer</th>
			</tr>
		</thead>
		<tbody>
			{#each data.titles as title (title.id)}
				<tr class="border-b last:border-0">
					<td class="py-2 pr-4">
						<a href={`${AdminRoutes.TITLES}/${title.id}`} class="hover:underline">{title.name}</a>
					</td>
					<td class="py-2 text-right tabular-nums">{title.memberCount}</td>
				</tr>
			{/each}
		</tbody>
	</table>
{:else}
	<p class="text-muted-foreground">Ingen titler ennå.</p>
{/if}

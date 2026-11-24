<script lang="ts">
	import { getLifetime } from '$lib/utils/helpers';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<h1 class="mb-6 text-2xl font-semibold">Forfattere</h1>

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
					<td class="py-2 pr-4">{author.name}</td>
					<td class="text-muted-foreground py-2 pr-4">{getLifetime(author) ?? '–'}</td>
					<td class="py-2 text-right tabular-nums">{author.bookCount}</td>
				</tr>
			{/each}
		</tbody>
	</table>
{:else}
	<p class="text-muted-foreground">Ingen forfattere ennå.</p>
{/if}

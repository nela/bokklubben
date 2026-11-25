<script lang="ts">
	import WarningBadge from '$lib/components/admin/warning-badge.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { AdminRoutes } from '$lib/routes';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const dateFmt = new Intl.DateTimeFormat('nb-NO', {
		dateStyle: 'medium',
		timeZone: 'Europe/Oslo'
	});
</script>

<h1 class="mb-2 text-2xl font-semibold">Bøker</h1>
<p class="text-muted-foreground mb-6 text-sm">
	Nye bøker legges til på møtene: boken som leses, og bøkene som pitches.
</p>

{#if data.books.length > 0}
	<table class="w-full text-left text-sm">
		<thead class="text-muted-foreground border-b">
			<tr>
				<th class="py-2 pr-4 font-medium">Tittel</th>
				<th class="hidden py-2 pr-4 font-medium sm:table-cell">Forfattere</th>
				<th class="py-2 text-right font-medium">Lest</th>
			</tr>
		</thead>
		<tbody>
			{#each data.books as book (book.id)}
				<tr class="border-b last:border-0">
					<td class="py-2 pr-4">
						<div class="flex flex-wrap items-center gap-1.5">
							<a href={`${AdminRoutes.BOOKS}/${book.id}`} class="hover:underline">{book.title}</a>
							{#if !book.onAMeet}
								<WarningBadge title="Ikke lest, pitchet eller valgt på noe møte">
									Ingen møte
								</WarningBadge>
							{/if}
							{#if book.authors.length === 0}
								<WarningBadge>Ingen forfatter</WarningBadge>
							{/if}
						</div>
					</td>
					<td class="text-muted-foreground hidden py-2 pr-4 sm:table-cell">
						{book.authors.join(', ') || '–'}
					</td>
					<td class="py-2 text-right whitespace-nowrap">
						{#if book.readAt}
							{dateFmt.format(book.readAt)}
						{:else}
							<Badge variant="outline">Ikke lest</Badge>
						{/if}
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
{:else}
	<p class="text-muted-foreground">Ingen bøker ennå.</p>
{/if}

<script lang="ts">
	import { Plus } from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button';
	import { AdminRoutes } from '$lib/routes';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const dateFmt = new Intl.DateTimeFormat('nb-NO', {
		dateStyle: 'medium',
		timeZone: 'Europe/Oslo'
	});
</script>

<div class="mb-2 flex items-center justify-between gap-4">
	<h1 class="text-2xl font-semibold">E-postmaler</h1>
	<Button href={`${AdminRoutes.EMAILS}/new`}><Plus />Ny mal</Button>
</div>
<p class="text-muted-foreground mb-6 text-sm">
	Maler du kan velge når du sender e-post til et medlem. De lagres i databasen, ikke i koden.
</p>

{#if data.templates.length > 0}
	<table class="w-full text-left text-sm">
		<thead class="text-muted-foreground border-b">
			<tr>
				<th class="py-2 pr-4 font-medium">Navn</th>
				<th class="hidden py-2 pr-4 font-medium sm:table-cell">Emne</th>
				<th class="py-2 text-right font-medium">Endret</th>
			</tr>
		</thead>
		<tbody>
			{#each data.templates as template (template.id)}
				<tr class="border-b last:border-0">
					<td class="py-2 pr-4">
						<a href={`${AdminRoutes.EMAILS}/${template.id}`} class="hover:underline">
							{template.name}
						</a>
					</td>
					<td class="text-muted-foreground hidden py-2 pr-4 sm:table-cell">{template.subject}</td>
					<td class="text-muted-foreground py-2 text-right whitespace-nowrap">
						{dateFmt.format(template.updatedAt)}
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
{:else}
	<p class="text-muted-foreground">Ingen maler ennå.</p>
{/if}

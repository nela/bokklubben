<script lang="ts">
	import { Mail, Plus } from '@lucide/svelte';
	import SendEmailSheet from '$lib/components/admin/send-email-sheet.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { AdminRoutes } from '$lib/routes';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const signedUpCount = $derived(data.members.filter((m) => m.signedUp).length);

	// Who a group email goes to. Starts as everyone current; former members are left out.
	const current = () => data.members.filter((m) => !m.former).map((m) => m.id);
	let selected = $state(current());
	const recipients = $derived(data.members.filter((m) => selected.includes(m.id)));
	let emailOpen = $state(false);

	const choose = (ids: Array<number>) => (selected = ids);
	const toggle = (id: number) =>
		(selected = selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id]);
</script>

<div class="mb-2 flex flex-wrap items-center justify-between gap-4">
	<h1 class="text-2xl font-semibold">Medlemmer</h1>
	<div class="flex flex-wrap gap-2">
		<Button variant="outline" disabled={selected.length === 0} onclick={() => (emailOpen = true)}>
			<Mail />Send e-post ({selected.length})
		</Button>
		<Button href={`${AdminRoutes.MEMBERS}/new`}><Plus />Nytt medlem</Button>
	</div>
</div>
<p class="text-muted-foreground mb-4 text-sm">
	{signedUpCount} av {data.members.length} har registrert seg.
</p>

<div class="text-muted-foreground mb-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
	<span>Velg:</span>
	<button type="button" class="hover:text-foreground underline" onclick={() => choose(current())}>
		Alle nåværende
	</button>
	<button
		type="button"
		class="hover:text-foreground underline"
		onclick={() => choose(data.members.filter((m) => !m.signedUp && !m.former).map((m) => m.id))}
	>
		Ikke registrert
	</button>
	<button type="button" class="hover:text-foreground underline" onclick={() => choose([])}>
		Ingen
	</button>
</div>

{#if data.members.length > 0}
	<table class="w-full text-left text-sm">
		<thead class="text-muted-foreground border-b">
			<tr>
				<th class="w-8 py-2 pr-2"><span class="sr-only">Velg</span></th>
				<th class="py-2 pr-4 font-medium">Navn</th>
				<th class="hidden py-2 pr-4 font-medium md:table-cell">E-post</th>
				<th class="hidden py-2 pr-4 font-medium sm:table-cell">Titler</th>
				<th class="py-2 text-right font-medium">Medlem siden</th>
			</tr>
		</thead>
		<tbody>
			{#each data.members as member (member.id)}
				<tr class={['border-b align-top last:border-0', member.former && 'text-muted-foreground']}>
					<td class="py-2 pr-2">
						<input
							type="checkbox"
							checked={selected.includes(member.id)}
							onchange={() => toggle(member.id)}
							aria-label={`Velg ${member.firstName} ${member.lastName}`}
							class="accent-primary size-4"
						/>
					</td>
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
						{member.titles.join(', ') || '–'}
					</td>
					<td class="py-2 text-right tabular-nums">{member.memberSince.getFullYear()}</td>
				</tr>
			{/each}
		</tbody>
	</table>
{:else}
	<p class="text-muted-foreground">Ingen medlemmer ennå.</p>
{/if}

<SendEmailSheet bind:open={emailOpen} {recipients} templates={data.emailTemplates} />

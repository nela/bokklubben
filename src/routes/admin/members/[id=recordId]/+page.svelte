<script lang="ts">
	import { onMount } from 'svelte';
	import { Mail } from '@lucide/svelte';
	import { replaceState } from '$app/navigation';
	import { page } from '$app/state';
	import DeleteForm from '$lib/components/admin/delete-form.svelte';
	import { failedForm } from '$lib/components/admin/form-values';
	import MemberForm from '$lib/components/admin/member-form.svelte';
	import SendEmailSheet from '$lib/components/admin/send-email-sheet.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	let emailOpen = $state(false);

	// Coming from "Nytt medlem": open "Send e-post" once, and drop the flag from the URL so a
	// reload doesn't open it again.
	onMount(() => {
		if (page.url.searchParams.has('send-email')) {
			emailOpen = true;
			const url = new URL(page.url);
			url.searchParams.delete('send-email');
			replaceState(url, page.state);
		}
	});
</script>

{#if data.member}
	{@const member = data.member}
	<div class="mb-2 flex flex-wrap items-center justify-between gap-4">
		<h1 class="text-2xl font-semibold">{member.firstName} {member.lastName}</h1>
		<Button variant="outline" onclick={() => (emailOpen = true)}><Mail />Send e-post</Button>
	</div>

	<div class="text-muted-foreground mb-6 flex flex-wrap items-center gap-2 text-sm">
		{#if member.signedUp}
			Har registrert seg.
		{:else}
			<Badge variant="outline" class="border-amber-500/50 text-amber-600 dark:text-amber-400">
				Ikke registrert
			</Badge>
			Har ikke logget inn ennå.
		{/if}
	</div>

	<MemberForm {member} titleOptions={data.titleOptions} form={failedForm(form)} />

	<div class="mt-10 border-t pt-6">
		<DeleteForm
			confirmMessage={`Slette ${member.firstName} ${member.lastName}? Innloggingen og oppmøtet slettes også. Møter de var vert for og bøker de pitchet beholdes.`}
		/>
	</div>

	<!-- Starts from «Invitasjon» for members who haven't signed up, if that template exists. -->
	<SendEmailSheet
		bind:open={emailOpen}
		recipients={[member]}
		templates={data.emailTemplates}
		preselect={member.signedUp ? undefined : 'Invitasjon'}
	/>
{:else}
	<h1 class="mb-2 text-2xl font-semibold">Nytt medlem</h1>
	<p class="text-muted-foreground mb-6 text-sm">
		Etter lagring kan du sende en invitasjon. Medlemmet logger så inn med e-postadressen sin.
	</p>

	<MemberForm member={null} titleOptions={data.titleOptions} form={failedForm(form)} />
{/if}

<script lang="ts">
	import { Mail } from '@lucide/svelte';
	import DeleteForm from '$lib/components/admin/delete-form.svelte';
	import { failedForm } from '$lib/components/admin/form-values';
	import MemberForm from '$lib/components/admin/member-form.svelte';
	import SendEmailSheet from '$lib/components/admin/send-email-sheet.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	let emailOpen = $state(false);
</script>

<div class="mb-2 flex flex-wrap items-center justify-between gap-4">
	<h1 class="text-2xl font-semibold">{data.member.firstName} {data.member.lastName}</h1>
	<Button variant="outline" onclick={() => (emailOpen = true)}><Mail />Send e-post</Button>
</div>

<div class="text-muted-foreground mb-6 flex flex-wrap items-center gap-2 text-sm">
	{#if data.member.signedUp}
		Har registrert seg.
	{:else}
		<Badge variant="outline" class="border-amber-500/50 text-amber-600 dark:text-amber-400">
			Ikke registrert
		</Badge>
		Har ikke logget inn ennå.
	{/if}
</div>

<MemberForm member={data.member} form={failedForm(form)} />

<div class="mt-10 border-t pt-6">
	<DeleteForm
		confirmMessage={`Slette ${data.member.firstName} ${data.member.lastName}? Innloggingen og oppmøtet slettes også. Møter de var vert for og bøker de pitchet beholdes.`}
	/>
</div>

<!-- Starts from «Invitasjon» for members who haven't signed up, if that template exists. -->
<SendEmailSheet
	bind:open={emailOpen}
	recipients={[data.member]}
	templates={data.emailTemplates}
	preselect={data.member.signedUp ? undefined : 'Invitasjon'}
/>

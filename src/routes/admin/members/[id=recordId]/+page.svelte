<script lang="ts">
	import DeleteForm from '$lib/components/admin/delete-form.svelte';
	import InviteButton from '$lib/components/admin/invite-button.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { failedForm } from '$lib/components/admin/form-values';
	import MemberForm from '$lib/components/admin/member-form.svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
</script>

<h1 class="mb-2 text-2xl font-semibold">{data.member.firstName} {data.member.lastName}</h1>

<div class="text-muted-foreground mb-6 flex flex-wrap items-center gap-2 text-sm">
	{#if data.member.signedUp}
		Har registrert seg.
	{:else}
		<Badge variant="outline" class="border-amber-500/50 text-amber-600 dark:text-amber-400">
			Ikke registrert
		</Badge>
		Har ikke logget inn ennå.
		<InviteButton />
	{/if}
</div>

<MemberForm member={data.member} form={failedForm(form)} />

<div class="mt-10 border-t pt-6">
	<DeleteForm
		confirmMessage={`Slette ${data.member.firstName} ${data.member.lastName}? Innloggingen og oppmøtet slettes også. Møter de var vert for og bøker de pitchet beholdes.`}
	/>
</div>

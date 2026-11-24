<script lang="ts">
	import DeleteForm from '$lib/components/admin/delete-form.svelte';
	import MeetForm from '$lib/components/admin/meet-form.svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	const dateFmt = new Intl.DateTimeFormat('nb-NO', { dateStyle: 'long', timeZone: 'Europe/Oslo' });
</script>

<h1 class="mb-6 text-2xl font-semibold">
	{data.meet ? `Møte ${dateFmt.format(data.meet.startsAt)}` : 'Nytt møte'}
</h1>

<MeetForm
	meet={data.meet}
	members={data.members}
	genres={data.genres}
	languages={data.languages}
	{form}
/>

{#if data.meet}
	<div class="mt-10 border-t pt-6">
		<DeleteForm
			confirmMessage="Slette møtet? Bøkene beholdes, men en bok som ble lest på dette møtet vises ikke lenger på siden."
		/>
	</div>
{/if}

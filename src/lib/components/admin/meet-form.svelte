<script lang="ts">
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import type { AdminFormState, AdminMeet, MemberOption } from '$lib/dto/admin';
	import { AdminRoutes } from '$lib/routes';
	import FormField from './form-field.svelte';
	import { fieldValue, osloDateTimeInput } from './form-values';
	import Select from './select.svelte';
	import Textarea from './textarea.svelte';

	let {
		meet,
		members,
		form
	}: {
		/** null when creating a new meet. */
		meet: AdminMeet | null;
		members: Array<MemberOption>;
		form: AdminFormState | null | undefined;
	} = $props();

	let pending = $state(false);

	const value = (name: string, saved: string) => fieldValue(form, name, saved);
	const errors = $derived(form?.errors ?? {});
	const hostId = $derived(value('hostId', meet?.hostId?.toString() ?? ''));
</script>

<form
	method="POST"
	action="?/save"
	class="flex flex-col gap-4"
	use:enhance={() => {
		pending = true;
		return async ({ result, update }) => {
			pending = false;
			if (result.type === 'redirect') {
				toast.success('Lagret');
			}
			await update({ reset: false });
		};
	}}
>
	<div class="grid gap-4 sm:grid-cols-2">
		<FormField label="Tidspunkt" id="startsAt" errors={errors.startsAt}>
			<Input
				id="startsAt"
				name="startsAt"
				type="datetime-local"
				required
				value={value('startsAt', osloDateTimeInput(meet?.startsAt))}
				aria-invalid={!!errors.startsAt}
			/>
		</FormField>

		<FormField label="Vert" id="hostId" errors={errors.hostId}>
			<Select id="hostId" name="hostId" aria-invalid={!!errors.hostId}>
				<option value="" selected={hostId === ''}>Ingen</option>
				{#each members as member (member.id)}
					<option value={member.id} selected={hostId === member.id.toString()}>
						{member.name}
					</option>
				{/each}
			</Select>
		</FormField>
	</div>

	<div class="grid gap-4 sm:grid-cols-2">
		<FormField label="Sted" id="location" errors={errors.location} hint="F.eks. «Hos Ola».">
			<Input
				id="location"
				name="location"
				value={value('location', meet?.location ?? '')}
				aria-invalid={!!errors.location}
			/>
		</FormField>

		<FormField label="Adresse" id="address" errors={errors.address}>
			<Input
				id="address"
				name="address"
				value={value('address', meet?.address ?? '')}
				aria-invalid={!!errors.address}
			/>
		</FormField>
	</div>

	<FormField label="Notater" id="notes" errors={errors.notes}>
		<Textarea
			id="notes"
			name="notes"
			rows={4}
			value={value('notes', meet?.notes ?? '')}
			aria-invalid={!!errors.notes}
		/>
	</FormField>

	{#if errors.form}
		<p class="text-destructive text-sm">{errors.form.join(' ')}</p>
	{/if}

	<div class="flex gap-2">
		<Button type="submit" disabled={pending}>{pending ? 'Lagrer…' : 'Lagre'}</Button>
		<Button variant="outline" href={AdminRoutes.MEETS}>Avbryt</Button>
	</div>
</form>

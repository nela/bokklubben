<script lang="ts">
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import DeleteForm from '$lib/components/admin/delete-form.svelte';
	import FormField from '$lib/components/admin/form-field.svelte';
	import { failedForm, fieldValue } from '$lib/components/admin/form-values';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { AdminRoutes } from '$lib/routes';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	const failed = $derived(failedForm(form));
	const errors = $derived(failed?.errors ?? {});

	let pending = $state(false);

	const deleteMessage = $derived.by(() => {
		if (!data.title) {
			return '';
		}
		const { name, members } = data.title;
		return members.length > 0
			? `Slette tittelen «${name}»? ${members.join(', ')} mister den.`
			: `Slette tittelen «${name}»?`;
	});
</script>

<h1 class="mb-6 text-2xl font-semibold">{data.title?.name ?? 'Ny tittel'}</h1>

<form
	method="POST"
	action={data.title ? '?/update' : '?/create'}
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
	<FormField
		label="Navn"
		id="name"
		errors={errors.name}
		hint={data.title ? 'Et nytt navn gir tittelen en ny adresse på siden.' : undefined}
	>
		<Input
			id="name"
			name="name"
			required
			value={fieldValue(failed, 'name', data.title?.name ?? '')}
			aria-invalid={!!errors.name}
		/>
	</FormField>

	{#if errors.form}
		<p class="text-destructive text-sm">{errors.form.join(' ')}</p>
	{/if}

	<div class="flex gap-2">
		<Button type="submit" disabled={pending}>{pending ? 'Lagrer…' : 'Lagre'}</Button>
		<Button variant="outline" href={AdminRoutes.TITLES}>Avbryt</Button>
	</div>
</form>

{#if data.title}
	<section class="mt-8">
		<h2 class="mb-2 text-sm font-medium">Medlemmer med tittelen</h2>
		{#if data.title.members.length > 0}
			<p class="text-muted-foreground text-sm">{data.title.members.join(', ')}</p>
		{:else}
			<p class="text-muted-foreground text-sm">Ingen. Tittelen gis under hvert medlem.</p>
		{/if}
	</section>

	<div class="mt-10 border-t pt-6">
		<DeleteForm confirmMessage={deleteMessage} />
	</div>
{/if}

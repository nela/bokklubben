<script lang="ts">
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import DeleteForm from '$lib/components/admin/delete-form.svelte';
	import FormField from '$lib/components/admin/form-field.svelte';
	import { failedForm, fieldValue } from '$lib/components/admin/form-values';
	import Textarea from '$lib/components/admin/textarea.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { emailPlaceholders } from '$lib/email-placeholders';
	import { AdminRoutes } from '$lib/routes';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	const failed = $derived(failedForm(form));
	const errors = $derived(failed?.errors ?? {});
	const value = (name: string, saved: string) => fieldValue(failed, name, saved);

	let pending = $state(false);
</script>

<h1 class="mb-6 text-2xl font-semibold">{data.template?.name ?? 'Ny mal'}</h1>

<form
	method="POST"
	action={data.template ? '?/update' : '?/create'}
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
		hint="Det du velger malen ved, f.eks. «Invitasjon»."
	>
		<Input
			id="name"
			name="name"
			required
			value={value('name', data.template?.name ?? '')}
			aria-invalid={!!errors.name}
		/>
	</FormField>

	<FormField label="Emne" id="subject" errors={errors.subject}>
		<Input
			id="subject"
			name="subject"
			required
			value={value('subject', data.template?.subject ?? '')}
			aria-invalid={!!errors.subject}
		/>
	</FormField>

	<FormField
		label="Tekst"
		id="body"
		errors={errors.body}
		hint="En tom linje gir nytt avsnitt. Logo og en knapp til siden legges til automatisk."
	>
		<Textarea
			id="body"
			name="body"
			rows={12}
			required
			value={value('body', data.template?.body ?? '')}
			aria-invalid={!!errors.body}
		/>
	</FormField>

	<div class="text-sm">
		<p class="mb-1 font-medium">Felter som fylles inn</p>
		<dl class="text-muted-foreground grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
			{#each Object.entries(emailPlaceholders) as [name, description] (name)}
				<dt><code>{`{${name}}`}</code></dt>
				<dd>{description}</dd>
			{/each}
		</dl>
	</div>

	{#if errors.form}
		<p class="text-destructive text-sm">{errors.form.join(' ')}</p>
	{/if}

	<div class="flex gap-2">
		<Button type="submit" disabled={pending}>{pending ? 'Lagrer…' : 'Lagre'}</Button>
		<Button variant="outline" href={AdminRoutes.EMAILS}>Avbryt</Button>
	</div>
</form>

{#if data.template}
	<div class="mt-10 border-t pt-6">
		<DeleteForm confirmMessage={`Slette malen «${data.template.name}»?`} />
	</div>
{/if}

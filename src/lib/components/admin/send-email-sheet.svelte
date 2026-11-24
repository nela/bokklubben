<script lang="ts">
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import * as Sheet from '$lib/components/ui/sheet';
	import type { AdminEmailTemplate, FieldErrors, SendEmailResult } from '$lib/dto/admin';
	import { emailPlaceholders } from '$lib/email-placeholders';
	import FormField from './form-field.svelte';
	import Select from './select.svelte';
	import Textarea from './textarea.svelte';

	let {
		open = $bindable(false),
		recipients,
		templates,
		preselect
	}: {
		open?: boolean;
		/** Each gets their own email. */
		recipients: Array<{ id: number; firstName: string; lastName: string; email: string }>;
		templates: Array<AdminEmailTemplate>;
		/** Name of the template to start with, if it exists (e.g. «Invitasjon»). */
		preselect?: string;
	} = $props();

	// Templates saved from the panel join the list without reloading the page.
	let available = $state([...templates]);
	let templateId = $state('');
	let subject = $state('');
	let body = $state('');
	let saveAsTemplate = $state(false);
	let errors = $state<FieldErrors>({});
	let pending = $state(false);

	function useTemplate(id: string) {
		templateId = id;
		const template = available.find((t) => t.id.toString() === id);
		subject = template?.subject ?? '';
		body = template?.body ?? '';
	}

	function reset() {
		const start = available.find((t) => t.name === preselect);
		useTemplate(start?.id.toString() ?? '');
		saveAsTemplate = false;
		errors = {};
	}
</script>

<Sheet.Root
	bind:open
	onOpenChange={(isOpen) => {
		if (isOpen) {
			reset();
		}
	}}
>
	<Sheet.Content class="w-full overflow-y-auto sm:max-w-lg">
		<Sheet.Header>
			<Sheet.Title>Send e-post</Sheet.Title>
			<Sheet.Description>
				{#if recipients.length === 1}
					Til {recipients[0].firstName}
					{recipients[0].lastName} ({recipients[0].email}).
				{:else}
					Til {recipients.length} medlemmer. Hver får sin egen e-post.
				{/if}
			</Sheet.Description>
			{#if recipients.length > 1}
				<details class="text-muted-foreground text-sm">
					<summary class="cursor-pointer">Vis mottakere</summary>
					<p class="mt-1">{recipients.map((r) => `${r.firstName} ${r.lastName}`).join(', ')}</p>
				</details>
			{/if}
		</Sheet.Header>

		<!--
			Posts to the page's sendEmail action (member page or member list). The result is handled
			here, without updating the page's `form`, so a form on the page keeps what's typed in it.
		-->
		<form
			method="POST"
			action="?/sendEmail"
			class="flex flex-col gap-4 px-4 pb-4"
			use:enhance={() => {
				pending = true;
				return async ({ result }) => {
					pending = false;
					if (result.type === 'success') {
						const { sent, failed, savedTemplate } = result.data as unknown as SendEmailResult;
						if (savedTemplate) {
							available = [
								...available,
								{ ...savedTemplate, subject, body, updatedAt: new Date() }
							];
							toast.success(`Malen «${savedTemplate.name}» er lagret`);
						}
						if (failed.length > 0) {
							toast.warning(
								`Sendt til ${sent.length} av ${sent.length + failed.length}. Feilet: ${failed.join(', ')}`,
								{ duration: Infinity }
							);
						} else {
							toast.success(
								sent.length === 1
									? `E-post sendt til ${sent[0]}`
									: `E-post sendt til ${sent.length} medlemmer`
							);
						}
						open = false;
					} else if (result.type === 'failure') {
						errors = (result.data?.errors as FieldErrors | undefined) ?? {};
					} else {
						errors = { form: ['Noe gikk galt. Prøv igjen.'] };
					}
				};
			}}
		>
			{#each recipients as recipient (recipient.id)}
				<input type="hidden" name="recipientIds" value={recipient.id} />
			{/each}

			<FormField label="Mal" id="send-email-template">
				<Select
					id="send-email-template"
					value={templateId}
					onchange={(event) => useTemplate(event.currentTarget.value)}
				>
					<option value="">Ny e-post</option>
					{#each available as template (template.id)}
						<option value={template.id.toString()}>{template.name}</option>
					{/each}
				</Select>
			</FormField>

			<FormField label="Emne" id="send-email-subject" errors={errors.subject}>
				<Input
					id="send-email-subject"
					name="subject"
					required
					bind:value={subject}
					aria-invalid={!!errors.subject}
				/>
			</FormField>

			<FormField
				label="Tekst"
				id="send-email-body"
				errors={errors.body}
				hint="En tom linje gir nytt avsnitt. Logo og en knapp til siden legges til automatisk."
			>
				<Textarea
					id="send-email-body"
					name="body"
					rows={12}
					required
					bind:value={body}
					aria-invalid={!!errors.body}
				/>
			</FormField>

			<p class="text-muted-foreground text-sm">
				Fylles inn:
				{#each Object.keys(emailPlaceholders) as name, i (name)}
					<code>{`{${name}}`}</code>{i < Object.keys(emailPlaceholders).length - 1 ? ', ' : ''}
				{/each}
			</p>

			<label class="flex items-center gap-2 text-sm">
				<input
					type="checkbox"
					name="saveAsTemplate"
					bind:checked={saveAsTemplate}
					class="accent-primary size-4"
				/>
				Lagre som ny mal
			</label>
			{#if saveAsTemplate}
				<FormField label="Navn på malen" id="send-email-template-name" errors={errors.templateName}>
					<Input
						id="send-email-template-name"
						name="templateName"
						required
						aria-invalid={!!errors.templateName}
					/>
				</FormField>
			{/if}

			{#if errors.form || errors.recipientIds}
				<p class="text-destructive text-sm">
					{[...(errors.form ?? []), ...(errors.recipientIds ?? [])].join(' ')}
				</p>
			{/if}

			<div class="flex gap-2">
				<Button type="submit" disabled={pending}>{pending ? 'Sender…' : 'Send'}</Button>
				<Button type="button" variant="outline" onclick={() => (open = false)}>Avbryt</Button>
			</div>
		</form>
	</Sheet.Content>
</Sheet.Root>

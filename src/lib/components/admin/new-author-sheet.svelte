<script lang="ts">
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import { Button } from '$lib/components/ui/button';
	import * as Sheet from '$lib/components/ui/sheet';
	import type { FieldErrors } from '$lib/dto/admin';
	import AuthorFields from './author-fields.svelte';

	let {
		open = $bindable(false),
		oncreated
	}: {
		open?: boolean;
		/** The author was saved; gets the saved name. */
		oncreated: (name: string) => void;
	} = $props();

	let errors = $state<FieldErrors>({});
	let pending = $state(false);
</script>

<Sheet.Root
	bind:open
	onOpenChange={(isOpen) => {
		if (!isOpen) {
			errors = {};
		}
	}}
>
	<Sheet.Content class="w-full overflow-y-auto sm:max-w-lg">
		<Sheet.Header>
			<Sheet.Title>Ny forfatter</Sheet.Title>
			<Sheet.Description>
				Forfatteren lagres med en gang, og kan så velges for boken.
			</Sheet.Description>
		</Sheet.Header>

		<!--
			Posts to the meet page's createAuthor action. The result is handled here, without
			updating the page's `form`, so the meet form keeps what has been typed into it.
		-->
		<form
			method="POST"
			action="?/createAuthor"
			class="flex flex-col gap-6 px-4 pb-4"
			use:enhance={({ formElement }) => {
				pending = true;
				return async ({ result }) => {
					pending = false;
					if (result.type === 'success' && result.data?.author) {
						const { name } = result.data.author as { name: string };
						formElement.reset();
						errors = {};
						open = false;
						toast.success(`${name} er lagt til`);
						oncreated(name);
					} else if (result.type === 'failure') {
						errors = (result.data?.errors as FieldErrors | undefined) ?? {};
					} else {
						errors = { form: ['Noe gikk galt. Prøv igjen.'] };
					}
				};
			}}
		>
			<AuthorFields idPrefix="new-author" {errors} />

			{#if errors.form}
				<p class="text-destructive text-sm">{errors.form.join(' ')}</p>
			{/if}

			<div class="flex gap-2">
				<Button type="submit" disabled={pending}>
					{pending ? 'Lagrer…' : 'Lagre forfatter'}
				</Button>
				<Button type="button" variant="outline" onclick={() => (open = false)}>Avbryt</Button>
			</div>
		</form>
	</Sheet.Content>
</Sheet.Root>

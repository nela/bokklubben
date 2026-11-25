<script lang="ts">
	import { enhance } from '$app/forms';
	import BkIcon from '$lib/components/icons/bk-icon.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	let pending = $state(false);
	const submit = () => {
		pending = true;
		return async ({ update }: { update: () => Promise<void> }) => {
			pending = false;
			await update();
		};
	};

	const message = $derived(form && 'message' in form ? form.message : null);
	const requested = $derived(!!form && 'requested' in form && form.requested);
</script>

<div
	class="bg-background flex h-dvh w-screen items-start justify-center pt-12 md:items-center md:pt-0"
>
	<div class="flex w-full max-w-md flex-col gap-8 px-4 sm:px-16">
		<div class="flex flex-col items-center gap-4 text-center">
			<BkIcon size={100} />
			<h1 class="text-xl font-semibold">
				{data.token ? 'Velg nytt passord' : 'Glemt passord'}
			</h1>
		</div>

		{#if data.token}
			<form method="POST" action="?/reset" class="flex flex-col gap-4" use:enhance={submit}>
				<input type="hidden" name="token" value={data.token} />
				<div class="flex flex-col gap-2">
					<Label for="password">Nytt passord</Label>
					<Input
						id="password"
						name="password"
						type="password"
						autocomplete="new-password"
						minlength={8}
						required
						class="bg-muted"
					/>
				</div>
				<div class="flex flex-col gap-2">
					<Label for="confirm">Gjenta passordet</Label>
					<Input
						id="confirm"
						name="confirm"
						type="password"
						autocomplete="new-password"
						minlength={8}
						required
						class="bg-muted"
					/>
				</div>
				{#if message}
					<p class="text-destructive text-sm">{message}</p>
				{/if}
				<Button type="submit" disabled={pending}>
					{pending ? 'Lagrer…' : 'Lagre passord'}
				</Button>
				<p class="text-muted-foreground text-sm">
					Du blir logget ut overalt, og logger inn med det nye passordet.
				</p>
			</form>
		{:else if requested}
			<div class="flex flex-col gap-4 text-sm">
				<p>
					Hvis <strong>{form && 'email' in form ? form.email : ''}</strong> tilhører et medlem, har vi
					sendt en lenke dit. Den virker i én time.
				</p>
				<p class="text-muted-foreground">
					Fikk du ingen e-post? Sjekk søppelpost, eller om du har logget inn før: første gang du
					logger inn med passord, lager du det selv.
				</p>
			</div>
		{:else}
			<form method="POST" action="?/request" class="flex flex-col gap-4" use:enhance={submit}>
				{#if data.expired}
					<p class="text-destructive text-sm">
						Lenken er utløpt eller allerede brukt. Be om en ny.
					</p>
				{/if}
				<p class="text-muted-foreground text-sm">
					Skriv e-posten du er medlem med, så sender vi en lenke for å velge nytt passord.
				</p>
				<div class="flex flex-col gap-2">
					<Label for="email">E-post</Label>
					<Input
						id="email"
						name="email"
						type="email"
						autocomplete="email"
						required
						value={form && 'email' in form ? form.email : ''}
						class="bg-muted"
					/>
				</div>
				{#if message}
					<p class="text-destructive text-sm">{message}</p>
				{/if}
				<Button type="submit" disabled={pending}>
					{pending ? 'Sender…' : 'Send lenke'}
				</Button>
			</form>
		{/if}

		<a href="/auth" class="text-muted-foreground text-center text-sm hover:underline">
			Tilbake til innlogging
		</a>
	</div>
</div>

<script lang="ts">
	import DatePicker from '$lib/components/date-picker.svelte';
	import SubmitButton from '$lib/components/submit-button.svelte';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { ClubTitle } from '$lib/dto/dto';
	import type { DateValue } from '@internationalized/date';
	import { quintOut } from 'svelte/easing';
	import { crossfade, fly } from 'svelte/transition';
	import type { ActionData } from '../auth/$types';

	let { form }: { form?: ActionData } = $props();

	const titles = Object.values(ClubTitle).sort((a, b) => a.localeCompare(b));
	// Note: 'pending' state might require use:enhance or a global navigation store subscription
	// depending on your project setup. Following the pattern from your auth form.
	const pending = $state(false);
	const success = $derived(!!form?.success);

	let memberSinceValue = $state<DateValue | undefined>();
	let memberSinceForm = $derived.by(() => memberSinceValue?.toDate('UTC'));

	let activeForm: 'member' | 'book' | 'event' = $derived('member');
</script>

<div class="bg-background flex h-dvh w-screen">
	<aside class="bg-muted/30 w-64 flex-shrink-0 border-r p-4">
		<h2 class="mb-4 text-lg font-semibold">Admin Menu</h2>
		<nav class="flex flex-col gap-1">
			<button
				onclick={() => (activeForm = 'member')}
				class="hover:bg-muted w-full rounded-lg p-2 text-left text-sm"
				class:bg-muted={activeForm === 'member'}
			>
				Invite Member
			</button>
			<button
				onclick={() => (activeForm = 'book')}
				class="hover:bg-muted w-full rounded-lg p-2 text-left text-sm"
				class:bg-muted={activeForm === 'book'}
			>
				Manage Books (soon)
			</button>
		</nav>
	</aside>

	<!-- <div class="bg-background flex w-screen items-start justify-center pt-12 md:items-center md:pt-0"> -->
	<main class="flex-1 overflow-x-hidden overflow-y-hidden p-4 md:p-8">
		<!-- <div class="flex w-full max-w-lg flex-col gap-8 rounded-2xl p-4 sm:p-8"> -->
		{#if activeForm === 'member'}
			<div class="relative mx-auto flex w-full max-w-lg flex-col gap-8">
				<div
					in:fly={{ x: -100, duration: 300, delay: 300 }}
					out:fly={{ x: -100, duration: 300 }}
					class="flex flex-col items-center justify-center gap-2 text-center"
				>
					<h1 class="text-2xl font-bold">Invite New Member</h1>
				</div>

				<form
					method="POST"
					class="flex flex-col gap-4"
					action="?/member"
					in:fly={{ x: -100, duration: 300, delay: 300 }}
					out:fly={{ x: -100, duration: 300 }}
				>
					<div class="flex gap-4">
						<div class="flex w-1/2 flex-col gap-2">
							<Label for="firstname">Fornavn</Label>
							<Input id="firstname" name="firstname" type="text" required class="bg-muted" />
						</div>
						<div class="flex w-1/2 flex-col gap-2">
							<Label for="lastname">Etternavn</Label>
							<Input id="lastname" name="lastname" type="text" required class="bg-muted" />
						</div>
					</div>

					<div class="flex flex-col gap-2">
						<Label for="username">Brukernavn (valgfri)</Label>
						<Input id="username" name="username" type="text" class="bg-muted" />
					</div>

					<div class="flex flex-col gap-2">
						<Label for="email">Epost</Label>
						<Input id="email" name="email" type="email" required class="bg-muted" />
					</div>

					<div class="flex flex-col gap-2">
						<Label>Medlem siden</Label>
						<DatePicker bind:value={memberSinceValue} />
						<input name="memberSince" type="hidden" value={memberSinceForm} />
					</div>

					<div class="flex flex-col gap-2">
						<Label for="appRole">Rettigheter</Label>
						<select
							name="appRole"
							id="appRole"
							class="bg-muted w-full rounded-md border p-2"
							required
						>
							<option value="regular">Regular</option>
							<option value="admin">Admin</option>
						</select>
					</div>

					<div class="flex flex-col gap-2">
						<Label>Titles</Label>
						<div class="grid grid-cols-2 gap-2 rounded-md p-4 md:grid-cols-3">
							{#each titles as title}
								<Label class="flex items-center gap-2 font-normal">
									<input type="checkbox" name="titles" value={title} class="bg-muted" />
									{title}
								</Label>
							{/each}
						</div>
					</div>

					{#if form?.message}
						<p class:text-red-500={!success} class:text-green-500={success}>{form.message}</p>
					{/if}

					<SubmitButton {pending} {success}>Invite Member</SubmitButton>
				</form>
			</div>
		{:else if activeForm === 'book'}
			<div class="relative mx-auto flex w-full max-w-lg flex-col gap-8">
				<div
					in:fly={{ x: -100, duration: 300, delay: 300 }}
					out:fly={{ x: -100, duration: 300 }}
					class="flex flex-col items-center justify-center gap-2 text-center"
				>
					<h1 class="text-2xl font-bold">Add new book</h1>
				</div>
			</div>
		{/if}
	</main>
</div>

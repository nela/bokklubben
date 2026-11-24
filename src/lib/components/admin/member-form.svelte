<script lang="ts">
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import * as Avatar from '$lib/components/ui/avatar';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import type { AdminFormState, AdminMember } from '$lib/dto/admin';
	import { ClubTitle, type ClubTitleKey } from '$lib/dto/dto';
	import { AdminRoutes } from '$lib/routes';
	import FormField from './form-field.svelte';
	import { dateInput, fieldValue, fieldValues } from './form-values';
	import Select from './select.svelte';

	let {
		member,
		form
	}: {
		member: AdminMember;
		form: AdminFormState | null | undefined;
	} = $props();

	let pending = $state(false);

	const value = (name: string, saved: string) => fieldValue(form, name, saved);
	const errors = $derived(form?.errors ?? {});
	const role = $derived(value('role', member.role));
	const titles = $derived(fieldValues(form, 'titles', member.titles));

	// A chosen file is previewed before it's saved; "remove" hides the current photo.
	let photoPreview = $state<string | null>(null);
	let removePhoto = $state(false);
	const shownPhoto = $derived(photoPreview ?? (removePhoto ? null : member.imageUrl));

	function previewPhoto(event: Event & { currentTarget: HTMLInputElement }) {
		if (photoPreview) {
			URL.revokeObjectURL(photoPreview);
		}
		const file = event.currentTarget.files?.[0];
		photoPreview = file ? URL.createObjectURL(file) : null;
		if (file) {
			removePhoto = false;
		}
	}

	const titleKeys = (Object.keys(ClubTitle) as Array<ClubTitleKey>).toSorted((a, b) =>
		ClubTitle[a].localeCompare(ClubTitle[b], 'nb-NO')
	);
</script>

<form
	method="POST"
	action="?/update"
	enctype="multipart/form-data"
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
	<div class="flex items-center gap-4">
		<Avatar.Root class="size-20">
			<Avatar.Image src={shownPhoto} alt={`${member.firstName} ${member.lastName}`} />
			<Avatar.Fallback>{member.firstName.charAt(0)}{member.lastName.charAt(0)}</Avatar.Fallback>
		</Avatar.Root>
		<div class="flex flex-1 flex-col gap-2">
			<FormField
				label="Profilbilde"
				id="photo"
				errors={errors.photo}
				hint="JPG, PNG, WebP, GIF eller AVIF, maks 4 MB."
			>
				<Input
					id="photo"
					name="photo"
					type="file"
					accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
					onchange={previewPhoto}
					aria-invalid={!!errors.photo}
				/>
			</FormField>
			{#if member.imageUrl && !photoPreview}
				<label class="flex items-center gap-2 text-sm">
					<input
						type="checkbox"
						name="removePhoto"
						bind:checked={removePhoto}
						class="accent-primary size-4"
					/>
					Fjern bildet
				</label>
			{/if}
		</div>
	</div>

	<div class="grid gap-4 sm:grid-cols-3">
		<FormField label="Fornavn" id="firstName" errors={errors.firstName}>
			<Input
				id="firstName"
				name="firstName"
				required
				value={value('firstName', member.firstName)}
				aria-invalid={!!errors.firstName}
			/>
		</FormField>
		<FormField label="Kallenavn" id="nickname" errors={errors.nickname}>
			<Input
				id="nickname"
				name="nickname"
				value={value('nickname', member.nickname ?? '')}
				aria-invalid={!!errors.nickname}
			/>
		</FormField>
		<FormField label="Etternavn" id="lastName" errors={errors.lastName}>
			<Input
				id="lastName"
				name="lastName"
				required
				value={value('lastName', member.lastName)}
				aria-invalid={!!errors.lastName}
			/>
		</FormField>
	</div>

	<div class="grid gap-4 sm:grid-cols-2">
		<FormField
			label="E-post"
			id="email"
			errors={errors.email}
			hint={member.signedUp
				? 'Endres også for innloggingen.'
				: 'Invitasjonen gjelder denne adressen.'}
		>
			<Input
				id="email"
				name="email"
				type="email"
				required
				value={value('email', member.email)}
				aria-invalid={!!errors.email}
			/>
		</FormField>
		<FormField label="Rolle" id="role" errors={errors.role}>
			<Select id="role" name="role" aria-invalid={!!errors.role}>
				<option value="regular" selected={role === 'regular'}>Medlem</option>
				<option value="admin" selected={role === 'admin'}>Admin</option>
			</Select>
		</FormField>
	</div>

	<div class="grid gap-4 sm:grid-cols-2">
		<FormField label="Medlem siden" id="memberSince" errors={errors.memberSince}>
			<Input
				id="memberSince"
				name="memberSince"
				type="date"
				required
				value={value('memberSince', dateInput(member.memberSince))}
				aria-invalid={!!errors.memberSince}
			/>
		</FormField>
		<FormField
			label="Medlem til"
			id="memberUntil"
			errors={errors.memberUntil}
			hint="Siste dag som medlem. Tom for nåværende medlemmer."
		>
			<Input
				id="memberUntil"
				name="memberUntil"
				type="date"
				value={value('memberUntil', dateInput(member.memberUntil))}
				aria-invalid={!!errors.memberUntil}
			/>
		</FormField>
	</div>

	<fieldset class="flex flex-col gap-2">
		<legend class="mb-2 text-sm font-medium">Titler</legend>
		<div class="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3">
			{#each titleKeys as key (key)}
				<label class="flex items-center gap-2 text-sm">
					<input
						type="checkbox"
						name="titles"
						value={key}
						checked={titles.includes(key)}
						class="accent-primary size-4"
					/>
					{ClubTitle[key]}
				</label>
			{/each}
		</div>
		{#if errors.titles}
			<p class="text-destructive text-sm">{errors.titles.join(' ')}</p>
		{/if}
	</fieldset>

	{#if errors.form}
		<p class="text-destructive text-sm">{errors.form.join(' ')}</p>
	{/if}

	<div class="flex gap-2">
		<Button type="submit" disabled={pending}>{pending ? 'Lagrer…' : 'Lagre'}</Button>
		<Button variant="outline" href={AdminRoutes.MEMBERS}>Avbryt</Button>
	</div>
</form>

<script lang="ts">
	import type { UserAdminInvitationDto } from '$lib/dto/dto';
	import { validators, firstToUpperRestToLowerCase } from '$lib/utils/helpers';

	let roles: Array<string> = $state(['']);
	let firstName: string = $state('');
	let lastName: string = $state('');
	let email: string = $state('');
	let admin: boolean | undefined = $state(undefined);

	let invitationSuccess: boolean | undefined = $state(undefined);
	let message: string | undefined = $state(undefined);

	const sendInvitation = async () => {
		if (!validators.parseEmail(email)) {
			console.error('Invalid email!');
			return;
		}

		const payload: UserAdminInvitationDto = {
			firstName: firstToUpperRestToLowerCase(firstName),
			lastName: firstToUpperRestToLowerCase(lastName),
			email: email,
			roles: roles.filter((r) => r.length > 0),
			admin: admin
		};

		let res: Response | undefined;
		try {
			res = await fetch('/invite', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(payload)
			});
		} catch (e) {
			console.error(e);
		} finally {
			invitationSuccess = res?.ok ?? false;
		}

		if (res) {
			console.log('here');
			message = await res.json().then((r: { message: string }) => r.message);
		}
	};
</script>

<h1>Invite new user</h1>

<div class="form">
	<input
		data-testid="firstName"
		aria-label="First name"
		type="text"
		placeholder="Fornavn"
		bind:value={firstName}
		required
	/>

	<input
		data-testid="lastName"
		aria-label="First name"
		type="text"
		placeholder="Etternavn"
		bind:value={lastName}
		required
	/>

	<input
		data-testid="email"
		aria-label="Email"
		type="text"
		placeholder="Email"
		bind:value={email}
		required
	/>

	<input data-testid="admin" aria-label="Is Admin" bind:checked={admin} type="checkbox" required />

	<div>
		{#each roles as r (r)}
			<input aria-label="custom role" type="input" />
		{/each}

		<button disabled={roles[roles.length - 1] === ''} onclick={() => roles.push('')}>
			Add role
		</button>
		<button disabled={roles.length <= 1} onclick={() => roles.length > 1 && roles.pop()}>
			Rm role
		</button>
		<button onclick={sendInvitation}>send</button>
	</div>

	{#if invitationSuccess !== undefined}
		{invitationSuccess}
		{message}
	{/if}
</div>

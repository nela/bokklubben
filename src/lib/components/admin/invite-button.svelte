<script lang="ts">
	import { enhance } from '$app/forms';
	import { Send } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';
	import { Button } from '$lib/components/ui/button';

	let pending = $state(false);
</script>

<!--
	Posts to the member page's `invite` action. The result is shown as a toast and not applied to
	the page, so the member form keeps what has been typed into it.
-->
<form
	method="POST"
	action="?/invite"
	use:enhance={() => {
		pending = true;
		return async ({ result }) => {
			pending = false;
			if (result.type === 'success') {
				toast.success(`Invitasjon sendt til ${result.data?.invitedEmail}`);
			} else if (result.type === 'failure') {
				const errors = result.data?.errors as { form?: Array<string> } | undefined;
				toast.error(errors?.form?.join(' ') ?? 'Kunne ikke sende invitasjonen.');
			} else {
				toast.error('Kunne ikke sende invitasjonen.');
			}
		};
	}}
>
	<Button type="submit" variant="outline" size="sm" disabled={pending}>
		<Send />{pending ? 'Sender…' : 'Send invitasjon'}
	</Button>
</form>

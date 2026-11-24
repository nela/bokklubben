<script lang="ts">
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import { Button } from '$lib/components/ui/button';

	let { confirmMessage }: { confirmMessage: string } = $props();

	let pending = $state(false);
</script>

<form
	method="POST"
	action="?/delete"
	use:enhance={({ cancel }) => {
		if (!confirm(confirmMessage)) {
			cancel();
			return;
		}
		pending = true;
		return async ({ result, update }) => {
			pending = false;
			if (result.type === 'redirect') {
				toast.success('Slettet');
			}
			await update();
		};
	}}
>
	<Button type="submit" variant="destructive" disabled={pending}>
		{pending ? 'Sletter…' : 'Slett'}
	</Button>
</form>

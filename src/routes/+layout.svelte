<script lang="ts">
	import { invalidate } from '$app/navigation';
	import '../app.css';
	import { ModeWatcher } from 'mode-watcher';
	import { onMount } from 'svelte';
	import { Toaster } from 'svelte-sonner';

	let { data, children } = $props();
	let { session, supabase } = $derived(data);

	onMount(() => {
		const { data } = supabase.auth.onAuthStateChange((_, newSession) => {
			if (newSession?.expires_at !== session?.expires_at) {
				invalidate('supabase:auth');
			}
		});
	});
</script>

<ModeWatcher />
{@render children()}

<Toaster position="bottom-right" theme="system" />

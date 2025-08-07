<script lang="ts">
	import '../app.css';
	import BkIcon from '$lib/components/icons/bk-icon.svelte';
	import { ThemeProvider } from '@sejohnson/svelte-themes';
	import { Toaster } from 'svelte-sonner';
	let { children } = $props();

	/* import { invalidate } from '$app/navigation'
	import { onMount } from 'svelte'
	let { data, children } = $props()
	let { session, supabase } = $derived(data)
	onMount(() => {
		const { data } = supabase.auth.onAuthStateChange((_, newSession) => {
			if (newSession?.expires_at !== session?.expires_at) {
				invalidate('supabase:auth')
			}
		})
		return () => data.subscription.unsubscribe()
	}) */
</script>

<ThemeProvider attribute="class" disableTransitionOnChange>
	{@render children()}

	<!-- <footer
		class="text-muted-foreground absolute bottom-0 flex w-full items-center justify-center gap-3 p-6 text-xs"
	>
		<BkIcon height={18} width={18} />
		<span>© {new Date().getFullYear()} Boklubben, Inc.</span>
	</footer> -->
	<Toaster position="bottom-right" theme="system" />
</ThemeProvider>

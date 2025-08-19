<script lang="ts">
	import '../app.css';
	import { ModeWatcher } from 'mode-watcher';
	import { Toaster } from 'svelte-sonner';
	let { children } = $props();
</script>

<ModeWatcher />
{@render children()}

<Toaster position="bottom-right" theme="system" />

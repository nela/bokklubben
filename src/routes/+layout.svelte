<script lang="ts">
	import '../app.css';
	// import { ThemeProvider } from '@sejohnson/svelte-themes';
	import { ModeWatcher } from 'mode-watcher';
	import { Toaster } from 'svelte-sonner';
	let { children } = $props();
</script>

<!-- <ThemeProvider attribute="class" disableTransitionOnChange> -->
<ModeWatcher />
{@render children()}

<Toaster position="bottom-right" theme="system" />

<!-- <footer
		class="text-muted-foreground absolute bottom-0 flex w-full items-center justify-center gap-3 p-6 text-xs"
	>
		<BkIcon height={18} width={18} />
		<span>© {new Date().getFullYear()} Boklubben, Inc.</span>
	</footer> -->
<!-- </ThemeProvider> -->

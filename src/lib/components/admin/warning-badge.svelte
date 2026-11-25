<script lang="ts">
	import type { Snippet } from 'svelte';
	import { Badge } from '$lib/components/ui/badge';

	/** An amber tag for something that needs attention in the admin, e.g. «Ingen forfatter». */
	let { title, children }: { title?: string; children: Snippet } = $props();
</script>

<Badge variant="outline" class="border-amber-500/50 text-amber-600 dark:text-amber-400" {title}>
	{@render children()}
</Badge>

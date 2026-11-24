<script lang="ts">
	import type { HTMLTextareaAttributes } from 'svelte/elements';
	import { cn } from '$lib/utils/shadcn';

	let { class: className, value = $bindable(), ...restProps }: HTMLTextareaAttributes = $props();
</script>

<!-- Styled like $lib/components/ui/input. -->
<textarea
	bind:value
	class={cn(
		'border-input bg-background dark:bg-input/30 placeholder:text-muted-foreground min-h-24 w-full rounded-md border px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none md:text-sm',
		'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
		'aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40',
		className
	)}
	{...restProps}
></textarea>

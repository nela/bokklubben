<script lang="ts">
	import type { HTMLSelectAttributes } from 'svelte/elements';
	import { cn } from '$lib/utils/shadcn';

	let {
		class: className,
		value = $bindable(),
		children,
		...restProps
	}: HTMLSelectAttributes = $props();
</script>

<!-- A native select, styled like $lib/components/ui/input. -->
<select
	bind:value
	class={cn(
		'border-input bg-background dark:bg-input/30 h-9 w-full rounded-md border px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none md:text-sm',
		'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
		'aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40',
		className
	)}
	{...restProps}
>
	{@render children?.()}
</select>

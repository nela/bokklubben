<script lang="ts">
	let {
		href,
		text,
		className,
		touchUnderline = true
	}: { href: string; text: string; className?: string; touchUnderline?: boolean } = $props();
</script>

<a
	{href}
	class={`hover:text-primary relative after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-current after:transition-all after:duration-300 hover:after:w-full ${touchUnderline ? 'pointer-coarse:decoration-muted-foreground/60 pointer-coarse:underline pointer-coarse:underline-offset-4' : ''} ${className}`}
>
	{text}
</a>

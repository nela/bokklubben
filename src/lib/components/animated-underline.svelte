<script lang="ts">
	let { href, text, className }: { href: string; text: string; className?: string } = $props();
</script>

<a
	{href}
	class={`hover:text-primary relative after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-current after:transition-all after:duration-300 hover:after:w-full ${className}`}
>
	{text}
</a>

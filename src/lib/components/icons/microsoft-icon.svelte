<script lang="ts">
	import type { WithElementRef } from '$lib/utils/types';
	import type { SVGAttributes } from 'svelte/elements';

	let {
		size = 16,
		ref = $bindable(null),
		...rest
	}: WithElementRef<SVGAttributes<SVGElement> & { size?: number }, SVGElement> = $props();
</script>

<svg
	width={size}
	height={size}
	viewBox="0 0 21 21"
	xmlns="http://www.w3.org/2000/svg"
	bind:this={ref}
	{...rest}
>
	<title>MS-SymbolLockup</title>
	<rect x="1" y="1" width="9" height="9" fill="#f25022" />
	<rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
	<rect x="11" y="1" width="9" height="9" fill="#7fba00" />
	<rect x="11" y="11" width="9" height="9" fill="#ffb900" />
</svg>

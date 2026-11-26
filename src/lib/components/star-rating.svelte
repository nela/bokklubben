<script lang="ts">
	let {
		value,
		max = 5,
		size = 18,
		showValue = false
	}: {
		value: number;
		max?: number;
		size?: number;
		showValue?: boolean;
	} = $props();

	// Share of the star's area left of each 5% step across its width, measured from the star path.
	// The arms are thin, so the last star is filled by area rather than by width.
	const AREA_BY_WIDTH = [
		0, 0.004, 0.015, 0.033, 0.058, 0.116, 0.187, 0.256, 0.33, 0.411, 0.5, 0.589, 0.67, 0.744, 0.813,
		0.884, 0.942, 0.967, 0.985, 0.996, 1
	];

	function widthForArea(area: number) {
		const i = AREA_BY_WIDTH.findIndex((a) => a >= area);
		if (i <= 0) return 0;
		const [a0, a1] = [AREA_BY_WIDTH[i - 1], AREA_BY_WIDTH[i]];
		return (i - 1 + (area - a0) / (a1 - a0)) / (AREA_BY_WIDTH.length - 1);
	}

	const fullStars = $derived(Math.floor(value));
	const fractional = $derived(value - fullStars);
	const emptyStars = $derived(max - fullStars - (fractional ? 1 : 0));
	// The star spans x≈2–22 of the 24-wide icon.
	const clipRight = $derived(((24 - (2 + 20 * widthForArea(fractional))) / 24) * 100);
</script>

<!-- <div class={`flex items-center gap-1 ${className}`} role="img"> -->
<!-- 	<span class="font-semibold">Goodreads rating:</span> -->
<div class="ml-2 flex items-center">
	{#each Array(fullStars) as _}
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			fill="currentColor"
			class="h-5 w-5 text-yellow-500"
		>
			<path
				fill-rule="evenodd"
				d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.007z"
				clip-rule="evenodd"
			/>
		</svg>
	{/each}
	{#if fractional}
		<div class="relative h-5 w-5">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				stroke-width="1.5"
				stroke="currentColor"
				class="absolute top-0 left-0 h-5 w-5 text-yellow-400"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
				/>
			</svg>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 24 24"
				fill="currentColor"
				class="absolute top-0 left-0 h-5 w-5 text-yellow-500"
				style={`clip-path: inset(0 ${clipRight}% 0 0)`}
			>
				<path
					fill-rule="evenodd"
					d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.007z"
					clip-rule="evenodd"
				/>
			</svg>
		</div>
	{/if}
	{#each Array(emptyStars) as _}
		<svg
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
			stroke-width="1.5"
			stroke="currentColor"
			class="h-5 w-5 text-yellow-500"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
			/>
		</svg>
	{/each}
	{#if showValue}
		<span class="text-muted-foreground ml-2 text-xs">{value.toFixed(1)}/{max}</span>
	{/if}
</div>
<!-- </div> -->

<!-- <div class={`flex items-center gap-1 ${className}`} role="img" aria-label={aria}>
  {#each Array.from({ length: max }) as _, i}
    <span
      class="relative inline-block shrink-0"
      style={`width:${size}px;height:${size}px`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 24 24"
        class="absolute inset-0 text-muted-foreground"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
      >
        <path
          d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
        />
      </svg>

      <div class="absolute inset-0 overflow-hidden" style={`width:${fillPercent(i + 1)}%`}>
        <svg
          viewBox="0 0 24 24"
          class="absolute inset-0 text-yellow-500"
          fill="currentColor"
        >
          <path
            d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
          />
        </svg>
      </div>
    </span>
  {/each}

  {#if showValue}
    <span class="ml-2 text-xs text-muted-foreground">{v.toFixed(1)}/{max}</span>
  {/if}

  <span class="sr-only">{aria}</span>
</div> -->

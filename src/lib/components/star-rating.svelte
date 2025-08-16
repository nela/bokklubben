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

	// const aria = $derived(`${v.toFixed(1)} out of ${max} stars`);
	// Clamp helper
	const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

	/**
	 * Symmetric concave/convex mapping that preserves the midpoint:
	 * - y(0.5) = 0.5 for any gamma > 0
	 * - gamma < 1 lifts small fractions and compresses large ones
	 * - gamma = 1 is linear (no skew)
	 */
	export function skewSymmetric(x: number, gamma = 0.8): number {
		const t = clamp01(x);
		if (t <= 0.5) {
			return 0.5 * Math.pow(2 * t, gamma);
		}
		return 1 - 0.5 * Math.pow(2 * (1 - t), gamma);
	}

	/** Truncate to N decimals (returns number) */
	export function truncTo(x: number, n = 3): number {
		const k = Math.pow(10, n);
		return Math.trunc(x * k) / k;
	}

	// Smoothstep for gentler transitions (optional but recommended)
	const smoothstep01 = (t: number) => t * t * (3 - 2 * t);

	// Linear interpolation
	const mix = (a: number, b: number, t: number) => a + (b - a) * t;

	/**
	 * Gamma that increases "strength" toward the edges.
	 * - center: gamma used at x = 0.5 (≈1.0 → almost linear at the midpoint)
	 * - edge:   gamma used at x = 0 or 1   (< center → stronger concave effect)
	 * - curve:  shapes how quickly it ramps up with distance (>=1 for gentler)
	 * - ease:   whether to apply smoothstep easing (true = smoother near 0.5)
	 */
	export function dynamicGamma(
		x: number,
		{
			center = 0.95,
			edge = 0.65,
			curve = 1.5,
			ease = true
		}: { center?: number; edge?: number; curve?: number; ease?: boolean } = {}
	): number {
		const t = clamp01(x);
		// distance from 0.5 mapped to [0,1]
		const d = 2 * Math.abs(t - 0.5);
		const w0 = Math.pow(d, Math.max(0.0001, curve)); // avoid 0^0
		const w = ease ? smoothstep01(w0) : w0;
		return mix(center, edge, w);
	}

	/**
	 * Symmetric skew that preserves the midpoint:
	 *   - y(0.5) = 0.5
	 *   - y(0) = 0, y(1) = 1
	 * Uses a gamma that varies with x: smaller near edges → stronger skew.
	 */
	export function skewSymmetricDynamic(
		x: number,
		opts?: Parameters<typeof dynamicGamma>[1]
	): number {
		const t = clamp01(x);
		const g = dynamicGamma(t, opts);
		if (t < 0.4) {
			return 0.8 * Math.pow(2 * t, g);
		}
		if (t >= 0.47 && t <= 0.53) {
			return 0.5 * Math.pow(2 * t, g);
		}
		return 1 - 0.8 * Math.pow(2 * (1 - t), g);
	}

	const fullStars = Math.floor(value);
	const fractional = value - fullStars;
	const emptyStars = max - fullStars - (fractional ? 1 : 0);
	const adjustedFraction = truncTo(
		skewSymmetricDynamic(fractional, {
			center: 0.95, // ~linear near 0.5
			edge: 0.5, // stronger lift/pull near edges
			curve: 1.7, // how quickly strength increases with distance
			ease: true // smoother transition
		}),
		3
	);
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
				style={`clip-path: inset(0 ${(1 - adjustedFraction) * 100}% 0 0`}
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
		<span class="text-muted-foreground ml-2 text-xs">{adjustedFraction.toFixed(1)}/{max}</span>
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

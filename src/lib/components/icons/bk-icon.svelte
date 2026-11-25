<script lang="ts">
	import type { WithElementRef } from '$lib/utils/types';
	import type { SVGAttributes } from 'svelte/elements';
	import { bkNormal, bkOriginal, bkSoft } from './bk-paths';

	/**
	 * The BK logo. Drawn in `currentColor`, so it takes the text colour around it and follows
	 * dark mode. `size` is the width in pixels; a CSS width/height (e.g. a `size-10` class) wins.
	 *
	 * `type`: `soft` (bk-soft, the logo), `original` (bk-original, as first drawn) or `normal`
	 * (the thin one).
	 *
	 * `flutter` (bindable): set it true (e.g. as the link around it is hovered) and the letters
	 * flutter once, like pages in a draught: each folds toward its spine and back, the B first,
	 * the K a moment after. It plays to the end and then sets itself back to false, ready for the
	 * next time. Not for people who have asked their system for less motion.
	 */
	let {
		size = 50,
		type = 'soft',
		flutter = $bindable(false),
		ref = $bindable(null),
		class: className,
		...rest
	}: WithElementRef<
		SVGAttributes<SVGElement> & {
			size?: number;
			type?: 'soft' | 'original' | 'normal';
			flutter?: boolean;
		},
		SVGElement
	> = $props();

	// The drawings, their proportions, and each letter's spine (where it folds toward).
	const logos = {
		soft: { paths: bkSoft, width: 88, height: 101, spines: ['41.5px 50px', '46.5px 50px'] },
		original: {
			paths: bkOriginal,
			width: 88,
			height: 101,
			spines: ['41.5px 50px', '46.5px 50px']
		},
		normal: { paths: bkNormal, width: 79, height: 93, spines: ['36.7px 46.5px', '41.7px 46.5px'] }
	} as const;
	const logo = $derived(logos[type]);
	const height = $derived(Math.round((size * logo.height) / logo.width));
</script>

<svg
	bind:this={ref}
	onanimationend={(event) => {
		// The K's flutter ends last; then it's done.
		if (event.animationName.includes('bk-flutter-k')) flutter = false;
	}}
	class={[flutter && 'flutter', className]}
	width={size}
	{height}
	viewBox={`0 0 ${logo.width} ${logo.height}`}
	fill="currentColor"
	xmlns="http://www.w3.org/2000/svg"
	aria-hidden="true"
	style:--b-spine={logo.spines[0]}
	style:--k-spine={logo.spines[1]}
	{...rest}
>
	<path class="b" d={logo.paths.b} />
	<path class="k" d={logo.paths.k} />
</svg>

<style>
	path {
		transform-box: view-box;
	}
	.b {
		transform-origin: var(--b-spine);
	}
	.k {
		transform-origin: var(--k-spine);
	}

	@media (prefers-reduced-motion: no-preference) {
		/* The B: three flaps, dying out. The K, a moment after: two. */
		.flutter .b {
			animation: bk-flutter-b 850ms ease-in-out;
		}
		.flutter .k {
			animation: bk-flutter-k 700ms ease-in-out 150ms both;
		}
	}

	@keyframes bk-flutter-b {
		0% {
			transform: scaleX(1);
		}
		20% {
			transform: scaleX(0.2);
		}
		40% {
			transform: scaleX(1.06);
		}
		58% {
			transform: scaleX(0.55);
		}
		75% {
			transform: scaleX(1.03);
		}
		88% {
			transform: scaleX(0.88);
		}
		100% {
			transform: scaleX(1);
		}
	}
	@keyframes bk-flutter-k {
		0% {
			transform: scaleX(1);
		}
		30% {
			transform: scaleX(0.15);
		}
		55% {
			transform: scaleX(1.05);
		}
		75% {
			transform: scaleX(0.7);
		}
		100% {
			transform: scaleX(1);
		}
	}
</style>

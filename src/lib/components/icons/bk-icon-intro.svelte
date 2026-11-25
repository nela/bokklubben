<script lang="ts">
	import type { WithElementRef } from '$lib/utils/types';
	import type { SVGAttributes } from 'svelte/elements';
	import { bkSoft } from './bk-paths';

	/**
	 * The logo making an entrance, for where it's shown big (the login page). Once, as the page
	 * loads: the outline is drawn and filled in, a band of light passes over it while a shadow
	 * comes up, and it stays with a slight gradient and the shadow. For people who have asked their
	 * system for less motion, it's shown straight away as it ends.
	 *
	 * The colours follow dark mode. Where the page sets --logo-soft-from, --logo-soft-to,
	 * --logo-shadow or --logo-sheen, those win (the logo page in admin shows it on light and dark).
	 */
	let {
		size = 150,
		ref = $bindable(null),
		class: className,
		...rest
	}: WithElementRef<SVGAttributes<SVGElement> & { size?: number }, SVGElement> = $props();

	const uid = $props.id();
	const gradientId = `bk-intro-gradient-${uid}`;
	const clipId = `bk-intro-clip-${uid}`;
	const sheenId = `bk-intro-sheen-${uid}`;

	const height = $derived(Math.round((size * 101) / 88));
	// The shadow grows with the logo, so it looks the same at every size.
	const shadowY = $derived(`${Math.max(1, size * 0.015)}px`);
	const shadowBlur = $derived(`${Math.max(1.5, size * 0.03)}px`);
</script>

<svg
	bind:this={ref}
	class={['bk-intro', className]}
	width={size}
	{height}
	viewBox="0 0 88 101"
	fill="currentColor"
	xmlns="http://www.w3.org/2000/svg"
	aria-hidden="true"
	style:--shadow-y={shadowY}
	style:--shadow-blur={shadowBlur}
	{...rest}
>
	<defs>
		<linearGradient id={gradientId} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="88" y2="101">
			<stop offset="0" class="from" />
			<stop offset="1" class="to" />
		</linearGradient>
		<clipPath id={clipId}>
			<path d={bkSoft.b} />
			<path d={bkSoft.k} />
		</clipPath>
		<linearGradient id={sheenId} x1="0" y1="0" x2="1" y2="0">
			<stop offset="0" class="sheen-edge" />
			<stop offset="0.5" class="sheen-middle" />
			<stop offset="1" class="sheen-edge" />
		</linearGradient>
	</defs>
	<path class="letter" d={bkSoft.b} fill={`url(#${gradientId})`} pathLength="1" />
	<path class="letter" d={bkSoft.k} fill={`url(#${gradientId})`} pathLength="1" />
	<g clip-path={`url(#${clipId})`}>
		<g transform="skewX(-20)">
			<rect class="sheen" x="0" y="-10" width="28" height="121" fill={`url(#${sheenId})`} />
		</g>
	</g>
</svg>

<style>
	/* Colours: near black to a little lighter; on dark, white to light grey. */
	.bk-intro {
		--from: var(--logo-soft-from, #09090b);
		--to: var(--logo-soft-to, #27272a);
		--shadow: var(--logo-shadow, rgb(0 0 0 / 0.3));
		--sheen: var(--logo-sheen, rgb(255 255 255 / 0.55));
	}
	:global(.dark) .bk-intro {
		--from: var(--logo-soft-from, #fafafa);
		--to: var(--logo-soft-to, #e4e4e7);
		--shadow: var(--logo-shadow, rgb(255 255 255 / 0.2));
		--sheen: var(--logo-sheen, rgb(255 255 255 / 0.7));
	}
	.from {
		stop-color: var(--from);
	}
	.to {
		stop-color: var(--to);
	}
	.sheen-middle {
		stop-color: var(--sheen);
	}
	.sheen-edge {
		stop-color: var(--sheen);
		stop-opacity: 0;
	}

	/* How it ends, and how it looks without motion: filled, with the shadow, no light band. */
	.bk-intro {
		filter: drop-shadow(0 var(--shadow-y) var(--shadow-blur) var(--shadow));
	}
	.sheen {
		transform: translateX(150px);
	}

	@media (prefers-reduced-motion: no-preference) {
		/* 1. The outline is drawn (0–1.6 s), then filled in (1.3–1.9 s). */
		.letter {
			stroke: currentColor;
			stroke-width: 0.8;
			stroke-dasharray: 1;
			stroke-dashoffset: 1;
			fill-opacity: 0;
			animation:
				bk-draw 1.6s ease-in-out forwards,
				bk-fill 0.6s ease 1.3s forwards;
		}
		/* 2. Then a band of light passes over once (2–3.4 s), starting right at the logo's edge… */
		.sheen {
			transform: translateX(-30px);
			animation: bk-sheen 1.4s ease-in-out 2s forwards;
		}
		/* …while the shadow comes up, evenly, finishing with it. */
		.bk-intro {
			filter: drop-shadow(0 var(--shadow-y) var(--shadow-blur) transparent);
			animation: bk-shadow 1.2s ease-in-out 2.2s forwards;
		}
	}

	@keyframes bk-draw {
		to {
			stroke-dashoffset: 0;
		}
	}
	@keyframes bk-fill {
		to {
			fill-opacity: 1;
			stroke-opacity: 0;
		}
	}
	@keyframes bk-sheen {
		to {
			transform: translateX(150px);
		}
	}
	@keyframes bk-shadow {
		to {
			filter: drop-shadow(0 var(--shadow-y) var(--shadow-blur) var(--shadow));
		}
	}
</style>

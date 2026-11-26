<script lang="ts">
	import type { Author } from '$lib/dto/dto';
	import * as Card from '$lib/components/ui/card/index.js';
	import { getLifetime, parseAwards } from '$lib/utils/helpers';
	import AnimatedUnderline from './animated-underline.svelte';
	import { Routes } from '$lib/routes';

	let {
		author,
		detail = 'awards'
	}: {
		author: Author;
		detail?: 'awards' | 'bio';
	} = $props();
	const authorHref = $derived(`${Routes.AUTHORS}/${author.slug}`);
	const lifetime = $derived(getLifetime(author));
	const splitName = $derived(author.name.replace(' ', '\n'));
	const intro = $derived((author.bio ?? '').split('\n').find((p) => p.trim()));
	const awards = $derived(parseAwards(author.awards));
</script>

<Card.Root
	class="grid grid-cols-[clamp(6rem,calc(100vw_-_15rem),8.5rem)_minmax(0,1fr)] grid-rows-[auto_1fr_auto] gap-x-4 gap-y-0 p-4 [grid-template-areas:'photo_header'_'photo_books'_'details_details'] md:grid-cols-[12rem_minmax(0,1fr)] md:grid-rows-[auto_auto_1fr] md:gap-x-6 md:[grid-template-areas:'photo_header'_'photo_details'_'photo_books']"
>
	<a href={authorHref} class="relative [grid-area:photo] md:min-h-52">
		<img
			src={author.imageUrl}
			alt={author.name}
			class="aspect-[3/4] w-full rounded-md object-cover object-top md:absolute md:inset-0 md:aspect-auto md:h-full"
		/>
	</a>

	<Card.Header class="content-start p-0 [grid-area:header]">
		<Card.Title>
			<AnimatedUnderline
				className="font-montserrat text-xl whitespace-pre-line md:whitespace-normal"
				href={authorHref}
				text={splitName}
				touchUnderline={false}
			/>
		</Card.Title>
		<Card.Description>{lifetime}</Card.Description>
	</Card.Header>

	{#if detail === 'bio' ? intro : awards.length > 0}
		<Card.Content class="mt-4 p-0 text-base [grid-area:details]">
			{#if detail === 'bio'}
				<a href={authorHref} class="line-clamp-3 leading-relaxed">{intro}</a>
			{:else}
				<h3 class="font-semibold">Priser</h3>
				<ul class="mt-1 space-y-1">
					{#each awards as { name, year }, i (i)}
						<li class="flex items-baseline gap-3">
							<span class="text-muted-foreground w-10 shrink-0 text-sm">{year ?? ''}</span>
							<span class="truncate" title={name}>{name}</span>
						</li>
					{/each}
				</ul>
			{/if}
		</Card.Content>
	{/if}

	{#if author.books && author.books.length > 0}
		<div class="mt-3 text-base [grid-area:books] md:mt-4">
			<h3 class="font-semibold">Bøker</h3>
			<ul class="mt-1 space-y-1">
				{#each author.books as book (book.slug)}
					<li class="truncate" title={book.title}>
						<AnimatedUnderline href={`${Routes.BOOKS}/${book.slug}`} text={book.title} />
					</li>
				{/each}
			</ul>
		</div>
	{/if}
</Card.Root>

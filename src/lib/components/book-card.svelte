<script lang="ts">
	import StarRating from '$lib/components/star-rating.svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import type { Book } from '$lib/dto/dto';
	import { Routes } from '$lib/routes';
	import AnimatedUnderline from './animated-underline.svelte';
	import { createSlug } from '$lib/utils/helpers';

	let {
		book,
		includeAuthor = true
	}: {
		book: Book;
		includeAuthor?: boolean;
	} = $props();

	const bookHref = $derived(`${Routes.BOOKS}/${book.slug}`);
</script>

<Card.Root
	class="grid grid-cols-[clamp(6rem,calc(100vw_-_15rem),8.5rem)_minmax(0,1fr)] gap-x-4 gap-y-0 p-4 [grid-template-areas:'cover_header'_'details_details'] md:grid-cols-[10rem_minmax(0,1fr)] md:grid-rows-[auto_1fr] md:[grid-template-areas:'cover_header'_'cover_details']"
>
	<a href={bookHref} class="[grid-area:cover]">
		<img src={book.imageUrl} alt={book.title} class="h-auto w-full rounded-md md:h-60" />
	</a>

	<Card.Header class="content-start p-0 [grid-area:header]">
		<Card.Title>
			<AnimatedUnderline
				href={bookHref}
				text={book.title}
				touchUnderline={false}
				className="font-montserrat text-xl font-semibold bg-gradient-to-r from-current to-current bg-no-repeat [background-position:0_100%] [background-size:0_1px] transition-[background-size] duration-300 hover:[background-size:100%_1px] "
			/>
		</Card.Title>
		<Card.Description>{book.firstPublished}</Card.Description>
		{#if includeAuthor}
			<Card.Description class="text-base">
				{#each book.authors as author, i (author.slug)}
					{@const authorHref = `${Routes.AUTHORS}/${author.slug}`}
					<AnimatedUnderline
						className="font-montserrat text-m"
						href={authorHref}
						text={author.name}
					/>
					{#if i < book.authors.length - 1},&nbsp;{/if}
				{/each}
			</Card.Description>
		{/if}
	</Card.Header>

	<Card.Content class="flex flex-col gap-2 p-0 pt-4 [grid-area:details] md:pt-6 md:pb-4">
		{#if book.awards.length > 0}
			<p class="text-base">
				<span class="font-semibold">Priser: </span>
				{book.awards.join(', ')}
			</p>
		{/if}

		{#if book.genres.length > 0}
			<p class="text-base">
				<span class="font-semibold">Sjanger: </span>
				{#each book.genres as genre, i (genre)}
					<AnimatedUnderline href={`${Routes.BOOK_GENRES}/${createSlug(genre)}`} text={genre} />
					{#if i < book.genres.length - 1},&nbsp;{/if}
				{/each}
			</p>
		{/if}

		{#if book.rating !== null}
			<div class="flex items-center gap-1" role="img">
				<span class="font-semibold">Goodreads rating:</span>
				<StarRating value={book.rating} />
				<span class="text-muted-foreground">({book.rating.toFixed(1)})</span>
			</div>
		{/if}
	</Card.Content>
</Card.Root>

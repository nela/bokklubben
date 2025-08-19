<script lang="ts">
	import StarRating from '$lib/components/star-rating.svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import type { Book } from '$lib/dto/dto';
	import { Routes } from '$lib/routes';
	import { createSlug } from '$lib/utils/helpers';
	import AnimatedUnderline from './animated-underline.svelte';

	let {
		book,
		includeAuthor = true
	}: {
		book: Book;
		includeAuthor?: boolean;
	} = $props();

	const bookHref = $derived(`${Routes.BOOKS}/${createSlug(book.title)}`);
</script>

<Card.Root class="flex flex-col gap-4 p-4 md:flex-row">
	<a href={bookHref} class="w-full flex-shrink-0 md:w-40">
		<img src={book.imageUrl} alt={book.title} class="h-auto w-full rounded-md md:h-60" />
	</a>

	<div class="flex flex-1 flex-col">
		<Card.Header class="p-0">
			<Card.Title>
				<AnimatedUnderline
					href={bookHref}
					text={book.title}
					className="font-montserrat text-xl font-semibold bg-gradient-to-r from-current to-current bg-no-repeat [background-position:0_100%] [background-size:0_1px] transition-[background-size] duration-300 hover:[background-size:100%_1px] "
				/>
			</Card.Title>
			{#if includeAuthor}
				<Card.Description class="text-base">
					{#each book.authors as author, i (author)}
						{@const authorHref = `${Routes.AUTHORS}/${createSlug(author)}`}
						<AnimatedUnderline className="font-montserrat text-m" href={authorHref} text={author} />
						{#if i < book.authors.length - 1},&nbsp;{/if}
					{/each}
				</Card.Description>
			{/if}
		</Card.Header>

		<Card.Content class="flex flex-col gap-2 px-0 py-4 pt-6">
			<p class="text-base">
				<span class="font-semibold">Utgivelsesår: </span>
				{book.firstPublished}
			</p>

			{#if book.awards}
				<p class="text-base">
					<span class="font-semibold">Priser: </span>
					{book.awards}
				</p>
			{/if}

			<p class="text-base">
				<span class="font-semibold">Sjanger: </span>
				{book.genre}
			</p>

			<div class="flex items-center gap-1" role="img">
				<span class="font-semibold">Goodreads rating:</span>
				<StarRating value={book.goodreadsRating} />
			</div>
		</Card.Content>
	</div>
</Card.Root>

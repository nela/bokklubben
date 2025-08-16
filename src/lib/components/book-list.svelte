<script lang="ts">
	import StarRating from '$lib/components/star-rating.svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import type { Book } from '$lib/dto/dto';
	import { Routes } from '$lib/routes';
	import { createSlug } from '$lib/utils/helpers';
	import AnimatedUnderline from './animated-underline.svelte';

	const { books }: { books: Array<Book> } = $props();
</script>

<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
	{#each books as book (createSlug(book.title))}
		{@const bookHref = `${Routes.BOOKS}/${createSlug(book.title)}`}
		<Card.Root class="flex flex-col gap-4 p-4 md:flex-row">
			<a href={bookHref} class="w-full flex-shrink-0 md:w-40">
				<img src={book.imageUrl} alt={book.title} class="h-auto w-full rounded-md md:h-60" />
			</a>

			<div class="flex flex-1 flex-col">
				<Card.Header class="p-0">
					<Card.Title>
						<AnimatedUnderline href={bookHref} text={book.title} className="font-montserrat text-xl font-semibold bg-gradient-to-r from-current to-current bg-no-repeat [background-position:0_100%] [background-size:0_1px] transition-[background-size] duration-300 hover:[background-size:100%_1px] "/>
					</Card.Title>
					<Card.Description class="text-base">
						{#each book.authors as author, i (author)}
							{@const authorHref = `${Routes.AUTHORS}/${createSlug(author)}`}
							<AnimatedUnderline className="font-montserrat text-m" href={authorHref} text={author} />
							{#if i < book.authors.length - 1},&nbsp;{/if}
						{/each}
					</Card.Description>
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
	{/each}
</div>

<!-- <div class="p-4">
	<div class="flex flex-col gap-4">
		{#each books as book (createSlug(book.title))}
			{@const bookHref = `/library/books/${createSlug(book.title)}`}
			<Card.Root class="flex flex-col gap-4 p-4 md:flex-row">
				<a href={bookHref} class="w-full flex-shrink-0 md:w-40">
					<img
						src={book.imageUrl}
						alt={book.title}
						class="h-auto w-full rounded-md md:h-60"
					/>
				</a>

				<div class="flex flex-1 flex-col">
					<Card.Header class="p-0">
						<Card.Title>
							<a
								href={bookHref}
								class="relative text-2xl font-semibold after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-current after:transition-all after:duration-300 hover:after:w-full"
							>
								{book.title}
							</a>
						</Card.Title>
						<Card.Description class="text-base">
							{#each book.authors as author, i (author)}
								{@const authorHref = `/library/authors/${createSlug(author)}`}
								<a
									href={authorHref}
									class="relative hover:text-primary after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-current after:transition-all after:duration-300 hover:after:w-full"
								>
									{author}
								</a>
								{#if i < book.authors.length - 1},&nbsp;{/if}
							{/each}
						</Card.Description>
					</Card.Header>

					<Card.Content class="flex flex-col gap-4 px-0 py-4 pt-6">
						<p class="text-base">
							<span class="font-semibold">Utgivelsesår: </span>
							{book.firstPublished}
						</p>

						{#if book.awards}
							<div class="text-base">
								<span class="font-semibold">Priser: </span>
								<ul class="list-inside list-disc">
									{#each book.awards.split(', ') as award}
										<li class="text-base">{award}</li>
									{/each}
								</ul>
							</div>
						{/if}

						<p class="text-base">
							<span class="font-semibold">Sjanger: </span>
							{book.genre}
						</p>
					</Card.Content>
				</div>
			</Card.Root>
		{/each}
	</div>
</div> -->

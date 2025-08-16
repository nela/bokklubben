
<script lang="ts">
	import type { Author } from '$lib/dto/dto';
	import * as Card from '$lib/components/ui/card/index.js';
	import { createSlug, getLifetime } from '$lib/utils/helpers';
	import AnimatedUnderline from './animated-underline.svelte';
	import { Routes } from '$lib/routes';

	const { authors }: { authors: Array<Author> } = $props();
</script>

<!-- <div class="flex flex-col gap-4"> -->
<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
	{#each authors as author (author.name)}
		{@const lifetime = getLifetime(author)}
		{@const authorHref = `${Routes.AUTHORS}/${createSlug(author.name)}`}
		<Card.Root class="flex flex-col gap-4 p-4 md:flex-row">
			<a href={authorHref} class="w-full md:w-auto">
				<img
					src={author.imageUrl}
					alt={author.name}
					class="w-full flex-shrink-0 rounded-md object-cover object-top aspect-[3/2] md:h-52 md:w-40 md:aspect-auto"
				/>
			</a>

			<div class="flex flex-1 flex-col">
				<Card.Header class="p-0">
					<Card.Title>
						<AnimatedUnderline className="font-montserrat text-xl" href={authorHref} text={author.name}/>
					</Card.Title>
					<Card.Description >{lifetime}</Card.Description>
				</Card.Header>

				<Card.Content class="flex flex-col gap-4 px-0 py-4 pt-6">
					{#if author.awards}
						<p class="text-base">
							<span class="font-semibold">Priser: </span>
							{author.awards}
						</p>
					{/if}

					{#if author.books && author.books.length > 0}
						<p class="text-base">
							<span class="font-semibold">Bøker: </span>
							{#each author.books as book, i (book.title)}
								{@const bookHref = `${Routes.AUTHORS}/${createSlug(book.title)}`}
								<AnimatedUnderline href={bookHref} text={book.title} />
								{#if i < author.books.length - 1},&nbsp;{/if}
							{/each}
						</p>
					{/if}
				</Card.Content>
			</div>
		</Card.Root>
	{/each}
</div>


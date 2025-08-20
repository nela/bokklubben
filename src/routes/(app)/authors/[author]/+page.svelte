<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import type { PageProps } from './$types';
	import { createSlug, getLifetime } from '$lib/utils/helpers';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import { Routes } from '$lib/routes';
	import BookCard from '$lib/components/book-card.svelte';

	const { data, params }: PageProps = $props();

	const author = $derived(
		data.authors.find((a) => createSlug(a.name.toLowerCase()) === params.author)
	);
	const books = $derived(
		data.books.filter((b) => author?.books.map((ab) => ab.title).includes(b.title)) ?? []
	);
</script>

{#if author}
	<div class="p-4">
		<div class="grid grid-cols-1 gap-8 md:grid-cols-3">
			<div class="col-span-1">
				<img
					src={author.imageUrl}
					alt={author.name}
					class="w-full rounded-md object-cover object-top"
				/>
			</div>

			<div class="col-span-1 flex flex-col gap-6 md:col-span-2">
				<div class="flex flex-col gap-2">
					<h1 class="text-4xl font-bold">{author.name}</h1>
					<p class="text-muted-foreground text-lg">{getLifetime(author)}</p>
				</div>

				<Separator orientation="horizontal" />

				<div>
					{#each author.description.split('\n').filter((p) => p) as paragraph}
						<p class="mb-4 text-base leading-relaxed">{paragraph}</p>
					{/each}
				</div>

				{#if author.awards}
					<div>
						<h2 class="text-lg font-semibold">Priser</h2>
						<ul class="list-inside list-disc">
							{#each author.awards.split(', ') as award}
								<li class="text-base">{award}</li>
							{/each}
						</ul>
					</div>
				{/if}
			</div>
		</div>

		<!-- Book List Section -->
		{#if books.length > 0}
			<div class="mt-12">
				<h2 class="mb-6 text-2xl font-bold">Bøker av {author.name}</h2>
				<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
					{#each books as book (book.title)}
						<BookCard {book} />
					{/each}
				</div>
			</div>
		{/if}
	</div>
{:else}
	<div class="flex h-full items-center justify-center p-10">
		<p class="text-muted-foreground">
			Fant ingen forfatter på denne siden. Kontakt support om feilmeldingen.
		</p>
	</div>
{/if}

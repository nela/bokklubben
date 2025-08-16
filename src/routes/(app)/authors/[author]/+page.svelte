<script lang="ts">
	import type { Author } from '$lib/dto/dto';
	import * as Card from '$lib/components/ui/card/index.js';
	import type { PageProps } from './$types';
	import { createSlug, getLifetime } from '$lib/utils/helpers';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import { Routes } from '$lib/routes';

	const { data, params }: PageProps = $props();

	const author = $derived(
		data.authors.find((a) => createSlug(a.name.toLowerCase()) === params.author)
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

				<!-- <div>
					<p class="text-base leading-relaxed">{author.description}</p>
				</div> -->
				<div>
					<!-- <h2 class="text-xl font-semibold">Om Forfatteren</h2> -->
					{#each author.description.split('\n').filter(p => p) as paragraph}
						<p class="text-base leading-relaxed mb-4">{paragraph}</p>
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
		{#if author.books && author.books.length > 0}
			<div class="mt-12">
				<h2 class="mb-6 text-2xl font-bold">Bøker av {author.name}</h2>
				<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
					{#each author.books as book (book.title)}
						{@const bookHref = `${Routes.BOOKS}/${createSlug(book.title)}`}
						<a href={bookHref}>
							<Card.Root class="p-4">
								<img src={book.imageUrl} alt={book.title} class="mb-4 w-full rounded-md" />
								<Card.Header class="p-0">
									<Card.Title class="text-lg">{book.title}</Card.Title>
								</Card.Header>
							</Card.Root>
						</a>
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

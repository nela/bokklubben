<script lang="ts">
	import type { PageProps } from './$types';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import StarRating from '$lib/components/star-rating.svelte';
	import AnimatedUnderline from '$lib/components/animated-underline.svelte';
	import { Routes } from '$lib/routes';
	import AuthorCard from '$lib/components/author-card.svelte';

	const { data, params }: PageProps = $props();

	const book = $derived(data.books.find((b) => b.slug === params.title));
	const authors = $derived(
		data.authors.filter((a) => book?.authors.some((ba) => ba.slug === a.slug))
	);

	function formatDate(date: Date) {
		return new Date(date).toLocaleDateString('no-NB', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	}
</script>

{#if book}
	<div class="mx-auto w-full max-w-6xl p-4 md:p-8">
		<div class="grid grid-cols-1 gap-8 md:grid-cols-3">
			<div class="col-span-1">
				<img
					src={book.imageUrl}
					alt={book.title}
					class="w-full rounded-md object-cover object-top shadow-lg"
				/>
			</div>

			<div class="col-span-1 flex flex-col gap-6 md:col-span-2">
				<div class="flex flex-col">
					<h1 class="font-montserrat text-4xl font-bold">{book.title}</h1>
					<div class="text-muted-foreground text-lg">
						<span class="font-montserrat mr-1">av</span>
						{#each book.authors as author, i (author.slug)}
							<AnimatedUnderline
								className="font-montserrat"
								href={`${Routes.AUTHORS}/${author.slug}`}
								text={author.name}
							/>
							{#if i < book.authors.length - 1},&nbsp;{/if}
						{/each}
					</div>
				</div>

				<Separator orientation="horizontal" />

				<div>
					{#each (book.description ?? '').split('\n').filter((p) => p) as paragraph}
						<p class="mb-4 text-base leading-relaxed">{paragraph}</p>
					{/each}
				</div>

				<!-- <div class="my-4 w-[70%]"> -->
				<!-- 	<Separator orientation="horizontal" /> -->
				<!-- </div> -->
				<div class="grid grid-cols-1 gap-x-4 gap-y-2 text-base sm:grid-cols-2">
					<p><span class="font-semibold">Utvigelsesår:</span> {book.firstPublished}</p>
					<p><span class="font-semibold">Antall sider:</span> {book.pages}</p>
					<p><span class="font-semibold">Originalspråk:</span> {book.originalLanguage}</p>
					{#if book.rating !== null}
						<p class="flex items-center gap-2">
							<span class="font-semibold">Goodreads rating:</span>
							<StarRating value={book.rating} />
						</p>
					{/if}
					{#if book.genres.length > 0}
						<p class="flex flex-wrap items-center gap-1">
							<span class="mr-1 font-semibold">Sjanger:</span>
							{#each book.genres as genre (genre)}
								<Badge>{genre}</Badge>
							{/each}
						</p>
					{/if}
					<p><span class="font-semibold">Lest:</span> {formatDate(book.readAt)}</p>

					{#if book.awards.length > 0}
						<div>
							<span class="font-semibold">Priser:</span>
							{#if book.awards.length > 1}
								<ul class="list-inside list-disc">
									{#each book.awards as award}
										<li class="text-base">{award}</li>
									{/each}
								</ul>
							{:else}
								<span>{book.awards[0]}</span>
							{/if}
						</div>
					{/if}
				</div>
			</div>
		</div>

		{#if authors.length > 0}
			<div class="mt-12">
				<h2 class="mb-6 text-2xl font-bold">Forfatter{authors.length > 1 ? 'e:' : ':'}</h2>
				<div class="grid max-w-3xl grid-cols-1 gap-4">
					{#each authors as author (author.slug)}
						<AuthorCard {author} />
					{/each}
				</div>
			</div>
		{/if}
	</div>
{:else}
	<div class="flex h-full items-center justify-center p-10">
		<p class="text-muted-foreground">
			Fant ingen bok på denne siden. Kontakt support om feilmeldingen.
		</p>
	</div>
{/if}

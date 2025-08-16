<script lang="ts">
	import AnimatedUnderline from '$lib/components/animated-underline.svelte';
	import StarRating from '$lib/components/star-rating.svelte';
	import * as Card from '$lib/components/ui/card';
	import { Separator } from '$lib/components/ui/separator';
	import { Routes } from '$lib/routes';
	import { createSlug, getLifetime } from '$lib/utils/helpers';
	import { MapPin, UserCircle } from '@lucide/svelte';

	const { data } = $props();
	const { allMembers, nextMeet, books, authors } = data;

	const relatedBook = $derived(
		nextMeet
			? books.find(
					(b) =>
						b.title === nextMeet.book.title &&
						b.authors.every((a) => nextMeet.book.authors.includes(a))
				)
			: undefined
	);

	const relatedAuthors = $derived(
		nextMeet ? authors.filter((a) => nextMeet.book.authors.includes(a.name)) : []
	);

	function formatMeetDate(date: Date) {
		return new Date(date).toLocaleDateString('no-NB', {
			weekday: 'long',
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}
</script>

<div class="space-y-12 p-4">
	{#if nextMeet}
		<section>
			<h1 class="mb-4 text-3xl font-bold">Neste Treff</h1>
			<Card.Root class="p-6">
				<Card.Header class="mb-4 p-0">
					<Card.Title class="text-2xl">
						{formatMeetDate(nextMeet.datetime)}
					</Card.Title>
				</Card.Header>
				<Card.Content class="space-y-3 p-0">
					<div class="flex items-center gap-3 text-lg">
						<MapPin class="text-muted-foreground h-5 w-5" />
						<span>{nextMeet.location}</span>
					</div>
					{#if nextMeet.host}
						<div class="flex items-center gap-3 text-lg">
							<UserCircle class="text-muted-foreground h-5 w-5" />
							<span>Vert: {nextMeet.host.firstname} {nextMeet.host.lastname}</span>
						</div>
					{/if}
				</Card.Content>
			</Card.Root>
		</section>
	{/if}

	{#if relatedBook}
		{@const bookHref = `${Routes.BOOKS}/${createSlug(relatedBook.title)}`}
		<section>
			<h2 class="mb-4 text-3xl font-bold">Bok</h2>
			<Card.Root class="flex flex-col gap-6 p-4 md:flex-row">
				<a href={bookHref} class="w-full flex-shrink-0 md:w-48">
					<img
						src={relatedBook.imageUrl}
						alt={relatedBook.title}
						class="h-auto w-full rounded-md shadow-lg"
					/>
				</a>

				<div class="flex flex-1 flex-col">
					<Card.Header class="p-0">
						<Card.Title>
							<AnimatedUnderline
								href={bookHref}
								text={relatedBook.title}
								className="font-montserrat text-2xl font-semibold"
							/>
						</Card.Title>
						<Card.Description class="text-lg">
							<span class="font-montserrat text-muted-foreground mr-1">av</span>
							{#each relatedBook.authors as author, i (author)}
								{@const authorHref = `${Routes.AUTHORS}/${createSlug(author)}`}
								<AnimatedUnderline className="font-montserrat" href={authorHref} text={author} />
								{#if i < relatedBook.authors.length - 1},&nbsp;{/if}
							{/each}
						</Card.Description>
					</Card.Header>

					<Card.Content class="flex flex-col gap-4 px-0 pt-6">
						{#each relatedBook.description.split('\n').filter((p) => p) as paragraph}
							<p class="text-base leading-relaxed">{paragraph}</p>
						{/each}

						<Separator orientation="horizontal" class="my-2" />

						<div class="grid grid-cols-1 gap-x-4 gap-y-2 text-base sm:grid-cols-2">
							<p><span class="font-semibold">Utgivelsesår:</span> {relatedBook.firstPublished}</p>
							<p><span class="font-semibold">Sider:</span> {relatedBook.pages}</p>
							<p><span class="font-semibold">Språk:</span> {relatedBook.originalLanguage}</p>
							<p class="flex items-center gap-2">
								<span class="font-semibold">Goodreads:</span>
								<StarRating value={relatedBook.goodreadsRating} />
							</p>
							<p>
								<span class="font-semibold">Sjanger:</span>
								{relatedBook.genre}
								<!-- <Badge variant="outline">{relatedBook.genre}</Badge> -->
							</p>
							<p>
								<span class="font-semibold">Lest:</span>
								{new Date(relatedBook.read).toLocaleDateString()}
							</p>

							{#if relatedBook.awards}
								{@const awards = relatedBook.awards.split(', ')}
								<div class="col-span-full">
									<span class="font-semibold">Priser:</span>
									{#if awards.length > 1}
										<ul class="list-inside list-disc">
											{#each awards as award}
												<li>{award}</li>
											{/each}
										</ul>
									{:else}
										<span class="ml-1">{awards[0]}</span>
									{/if}
								</div>
							{/if}
						</div>
					</Card.Content>
				</div>
			</Card.Root>
		</section>
	{/if}

	{#if relatedAuthors.length > 0}
		<section>
			<h2 class="mb-4 text-3xl font-bold">Forfatter{relatedAuthors.length > 1 ? 'e' : ''}</h2>
			<div class="space-y-6">
				{#each relatedAuthors as author (author.name)}
					{@const authorHref = `${Routes.AUTHORS}/${createSlug(author.name)}`}
					<Card.Root class="flex flex-col gap-6 p-4 md:flex-row">
						<a href={authorHref} class="w-full flex-shrink-0 md:w-48">
							<img
								src={author.imageUrl}
								alt={author.name}
								class="h-auto w-full rounded-md object-cover object-top shadow-lg"
							/>
						</a>
						<div class="flex flex-1 flex-col">
							<Card.Header class="p-0">
								<Card.Title>
									<AnimatedUnderline
										className="font-montserrat text-2xl font-semibold"
										href={authorHref}
										text={author.name}
									/>
								</Card.Title>
								<Card.Description class="text-muted-foreground text-lg">
									{getLifetime(author)}
								</Card.Description>
							</Card.Header>

							<Card.Content class="flex flex-col gap-4 px-0 pt-6">
								{#each author.description.split('\n').filter((p) => p) as paragraph}
									<p class="text-base leading-relaxed">{paragraph}</p>
								{/each}

								{#if author.awards}
									<div>
										<h3 class="text-md mb-2 font-semibold">Priser</h3>
										<ul class="list-inside list-disc">
											{#each author.awards.split(', ') as award}
												<li>{award}</li>
											{/each}
										</ul>
									</div>
								{/if}
							</Card.Content>
						</div>
					</Card.Root>
				{/each}
			</div>
		</section>
	{/if}
</div>

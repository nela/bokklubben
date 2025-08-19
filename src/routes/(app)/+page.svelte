<script lang="ts">
	import AnimatedUnderline from '$lib/components/animated-underline.svelte';
	import MemberCard from '$lib/components/member-card.svelte';
	import StarRating from '$lib/components/star-rating.svelte';
	import * as Card from '$lib/components/ui/card';
	import { Routes } from '$lib/routes';
	import { createSlug, getLifetime } from '$lib/utils/helpers';

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

	const host = $derived(
		nextMeet?.host
			? allMembers.find(
					(m) => m.firstname === nextMeet.host!.firstname && m.lastname === nextMeet.host!.lastname
				)
			: undefined
	);

	function formatMeetDate(date: Date) {
		const datestring = new Date(date).toLocaleDateString('no-NB', {
			weekday: 'long',
			month: 'long',
			day: 'numeric'
		});

		return datestring.charAt(0).toUpperCase() + datestring.slice(1);
	}

	const timeFmt = new Intl.DateTimeFormat('nb-NO', {
		hour: '2-digit',
		minute: '2-digit',
		hour12: false,
		timeZone: 'Europe/Oslo'
	});
</script>

<div class="space-y-12 p-4">
	<h1 class="font-unbounded mb-16 text-3xl font-bold">Kommende bokklubb</h1>
	{#if nextMeet}
		<div class="grid grid-cols-1 items-stretch gap-8 {host ? 'md:grid-cols-2' : ''}">
			<section class="flex flex-col">
				<h2 class="font-montserrat mb-4 text-xl font-bold">Oppmøte</h2>
				<Card.Root class="flex-grow p-6">
					<div class="space-y-2 text-lg">
						<div class="flex items-center gap-2">
							<p class="font-bold">Dato:</p>
							<p>{formatMeetDate(nextMeet.datetime)}</p>
						</div>
						<div class="flex items-center gap-2">
							<p class="font-bold">Klokkeslett:</p>
							<p>{timeFmt.format(nextMeet.datetime)}</p>
						</div>
						<div class="flex items-center gap-2">
							<p class="font-bold">Sted:</p>
							<p>{nextMeet.location}</p>
						</div>
						{#if nextMeet.address}
							<div class="flex items-center gap-2">
								<p class="font-bold">Adresse:</p>
								<p>{nextMeet.address}</p>
							</div>
						{/if}
					</div>
				</Card.Root>
			</section>

			{#if host}
				<section class="flex flex-col">
					<h2 class="font-montserrat mb-4 text-xl font-bold">Host</h2>
					<MemberCard variant="short" member={host} className="flex-grow" />
				</section>
			{/if}
		</div>
	{/if}

	<div class="grid grid-cols-1 items-stretch gap-8 md:grid-cols-2">
		{#if relatedBook}
			{@const bookHref = `${Routes.BOOKS}/${createSlug(relatedBook.title)}`}
			<section>
				<h2 class="font-montserrat mb-4 text-xl font-bold">Bok</h2>
				<Card.Root class="flex flex-col gap-4 p-4 md:flex-row">
					<a href={bookHref} class="w-full flex-shrink-0 md:w-48">
						<img
							src={relatedBook.imageUrl}
							alt={relatedBook.title}
							class="h-72 w-full rounded-md object-cover shadow-lg"
						/>
					</a>

					<div class="flex flex-1 flex-col">
						<Card.Header class="p-0">
							<Card.Title>
								<AnimatedUnderline
									href={bookHref}
									text={relatedBook.title}
									className="font-montserrat text-xl font-semibold bg-gradient-to-r from-current to-current bg-no-repeat [background-position:0_100%] [background-size:0_1px] transition-[background-size] duration-300 hover:[background-size:100%_1px] "
								/>
							</Card.Title>
						</Card.Header>

						<Card.Content class="flex flex-col gap-2 px-0 py-4 pt-6">
							<p class="text-base">
								<span class="font-semibold">Utgivelsesår: </span>
								{relatedBook.firstPublished}
							</p>

							{#if relatedBook.awards}
								<p class="text-base">
									<span class="font-semibold">Priser: </span>
									{relatedBook.awards}
								</p>
							{/if}

							<p class="text-base">
								<span class="font-semibold">Sjanger: </span>
								{relatedBook.genre}
							</p>

							<div class="flex items-center gap-1" role="img">
								<span class="font-semibold">Goodreads rating:</span>
								<StarRating value={relatedBook.goodreadsRating} />
							</div>
						</Card.Content>
					</div>
				</Card.Root>
			</section>
		{/if}

		{#if relatedAuthors.length > 0}
			<section>
				<h2 class="mb-4 text-xl font-bold">Forfatter{relatedAuthors.length > 1 ? 'e' : ''}</h2>
				{#each relatedAuthors as author (author.name)}
					{@const authorHref = `${Routes.BOOKS}/${createSlug(author.name)}`}
					{@const lifetime = getLifetime(author)}
					<Card.Root class="flex flex-col gap-4 p-4 md:flex-row">
						<a href={authorHref} class="w-full flex-shrink-0 md:w-48">
							<img
								src={author.imageUrl}
								alt={author.name}
								class="h-72 w-full rounded-md object-cover object-top shadow-lg"
							/>
						</a>

						<div class="flex flex-1 flex-col">
							<Card.Header class="p-0">
								<Card.Title>
									<AnimatedUnderline
										className="font-montserrat text-xl"
										href={authorHref}
										text={author.name}
									/>
								</Card.Title>
								<Card.Description>{lifetime}</Card.Description>
							</Card.Header>

							<Card.Content class="flex flex-col gap-4 px-0 py-4 pt-6">
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
			</section>
		{/if}
	</div>
</div>

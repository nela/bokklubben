<script lang="ts">
	import type { Author } from '$lib/dto/dto';
	import * as Card from '$lib/components/ui/card/index.js';
	import { getLifetime } from '$lib/utils/helpers';
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
	const intro = $derived((author.bio ?? '').split('\n').find((p) => p.trim()));
	const awards = $derived(
		author.awards.map((award) => {
			const match = award.match(/^(.*?)\s*\((\d{4})\)\s*$/);
			return match ? { name: match[1], year: match[2] } : { name: award, year: null };
		})
	);
</script>

<Card.Root class="flex flex-col gap-4 p-4 md:flex-row md:gap-6">
	<a href={authorHref} class="relative w-full shrink-0 md:min-h-52 md:w-48">
		<img
			src={author.imageUrl}
			alt={author.name}
			class="aspect-[3/4] w-full rounded-md object-cover object-top md:absolute md:inset-0 md:aspect-auto md:h-full"
		/>
	</a>

	<div class="flex min-w-0 flex-1 flex-col">
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

		<Card.Content class="flex flex-col gap-4 p-0 pt-4 text-base">
			{#if detail === 'bio'}
				{#if intro}
					<p class="line-clamp-3 leading-relaxed">{intro}</p>
				{/if}
			{:else if awards.length > 0}
				<div>
					<h3 class="font-semibold">Priser</h3>
					<ul class="mt-1 space-y-1">
						{#each awards as { name, year }, i (i)}
							<li class="flex items-baseline gap-3">
								<span class="text-muted-foreground w-10 shrink-0 text-sm">{year ?? ''}</span>
								<span class="truncate" title={name}>{name}</span>
							</li>
						{/each}
					</ul>
				</div>
			{/if}

			{#if author.books && author.books.length > 0}
				<div>
					<h3 class="font-semibold">Bøker</h3>
					<ul class="mt-1 space-y-1">
						{#each author.books as book (book.slug)}
							<li>
								<AnimatedUnderline href={`${Routes.BOOKS}/${book.slug}`} text={book.title} />
							</li>
						{/each}
					</ul>
				</div>
			{/if}
		</Card.Content>
	</div>
</Card.Root>

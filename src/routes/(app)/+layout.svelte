<script lang="ts">
	import type { LayoutProps } from './$types';
	import { BookIcon, Gavel, PenTool, ScrollText, Users } from '@lucide/svelte';
	import * as Sidebar from '$lib/components/ui/sidebar/index';
	import AppSidebar from '$lib/components/app-sidebar.svelte';
	import Header from '$lib/components/header.svelte';
	import { page } from '$app/state';
	import type { NavItemBase, NavItemPrimary } from '$lib/model';
	import { Routes } from '$lib/routes';
	import { authClient } from '$lib/auth-client';
	import { goto } from '$app/navigation';
	import { createSlug } from '$lib/utils/helpers';

	let { data, children }: LayoutProps = $props();
	const { allMembers, books, authors, member } = data;

	const primaryItems: Array<NavItemPrimary> = [
		{
			title: 'Medlemmer',
			pathname: Routes.MEMBERS,
			hideFromSidebar: false,
			icon: Users,
			// The titles members hold, each once.
			items: [...new Map(allMembers.flatMap((m) => m.titles).map((t) => [t.slug, t])).values()]
				.toSorted((a, b) => a.name.localeCompare(b.name, 'nb-NO'))
				.map((t) => ({
					title: t.name,
					pathname: `${Routes.MEMBER_TITLES}/${t.slug}`,
					hideFromSidebar: false
				}))
		},
		{
			title: 'Bøker',
			pathname: Routes.BOOKS,
			icon: BookIcon,
			hideFromSidebar: false,
			items: [...new Set(books.map((b) => b.readAt.getFullYear()))]
				.toSorted((a, b) => b - a)
				.map(
					(year): NavItemBase => ({
						hideFromSidebar: false,
						title: year.toString(),
						pathname: `${Routes.BOOKS}/${year}`,
						group: 'År'
					})
				)
				.concat(
					// The genres the books have, each once, alphabetically.
					[...new Map(books.flatMap((b) => b.genres).map((g) => [createSlug(g), g])).entries()]
						.toSorted(([, a], [, b]) => a.localeCompare(b, 'nb-NO'))
						.map(([slug, genre]) => ({
							hideFromSidebar: false,
							title: genre,
							pathname: `${Routes.BOOK_GENRES}/${slug}`,
							group: 'Sjanger'
						}))
				)
				.concat(
					books.map((b) => ({
						title: b.title,
						pathname: `${Routes.BOOKS}/${b.slug}`,
						hideFromSidebar: true
					}))
				)
		},
		{
			title: 'Forfattere',
			pathname: Routes.AUTHORS,
			hideFromSidebar: false,
			icon: PenTool,
			items: authors
				.map((a) => ({
					title: a.name,
					hideFromSidebar: true,
					pathname: `${Routes.AUTHORS}/${a.slug}`
				}))
				.toSorted((a, b) => a.title.localeCompare(b.title, 'nb-NO'))
		},
		{
			title: 'Protokoll',
			pathname: Routes.PROTOCOL,
			icon: ScrollText,
			hideFromSidebar: false,
			items: []
		},
		{
			title: 'Regler',
			pathname: Routes.RULES,
			icon: Gavel,
			hideFromSidebar: false,
			items: []
		}
	];

	const activePrimary = $derived(
		primaryItems.find((i) => page.url.pathname.startsWith(i.pathname))
	);
	const breadcrumbs = $derived.by(() => {
		if (!activePrimary) {
			return [];
		}
		const secondary = (activePrimary?.items ?? []).find((i) =>
			page.url.pathname.startsWith(i.pathname)
		);
		const primary = { crumb: activePrimary.title, pathname: activePrimary.pathname };

		return secondary
			? [primary, { crumb: secondary.title, pathname: secondary.pathname }]
			: [primary];
	});

	const signOut = async () => {
		await authClient.signOut();
		await goto('/auth', { invalidateAll: true });
	};
</script>

<div class="[--header-height:calc(--spacing(14))]">
	<Sidebar.Provider class="flex flex-col">
		<div class="flex flex-1">
			<AppSidebar variant="inset" {signOut} {primaryItems} {activePrimary} member={member!} />
			<Sidebar.Inset>
				<Header {breadcrumbs} />
				{@render children?.()}
			</Sidebar.Inset>
		</div>
	</Sidebar.Provider>
</div>

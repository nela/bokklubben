<script lang="ts">
	import type { LayoutProps } from './$types';
	import { BookIcon, Gavel, PenTool, ScrollText, Users } from '@lucide/svelte';
	import * as Sidebar from '$lib/components/ui/sidebar/index';
	import AppSidebar from '$lib/components/app-sidebar.svelte';
	import Header from '$lib/components/header.svelte';
	import { page } from '$app/state';
	import { ClubTitle } from '$lib/dto/dto';
	import type { NavItemPrimary } from '$lib/model';
	import { createSlug } from '$lib/utils/helpers';
	import { Routes } from '$lib/routes';
	import { fly } from 'svelte/transition';

	let { data, children }: LayoutProps = $props();

	const { allMembers, books, authors, member } = data;
	const nonNullMember = member!;

	const primaryItems: Array<NavItemPrimary> = [
		{
			title: 'Medlemmer',
			pathname: Routes.MEMBERS,
			hideFromSidebar: false,
			icon: Users,
			items: [...new Set(allMembers.flatMap((m) => m.titles))]
				.toSorted((a, b) =>
					ClubTitle[a as keyof typeof ClubTitle].localeCompare(
						ClubTitle[b as keyof typeof ClubTitle],
						'nb-NO'
					)
				)
				.map((t) => {
					const tmp = ClubTitle[t as keyof typeof ClubTitle];
					const title = tmp === ClubTitle.FOUNDING_FATHER ? tmp + 's' : tmp;

					return {
						title: title,
						type: 'secondary',
						pathname: `${Routes.MEMBERS}/${t.toLowerCase()}`,
						hideFromSidebar: false
					};
				})
		},
		{
			title: 'Bøker',
			pathname: Routes.BOOKS,
			icon: BookIcon,
			hideFromSidebar: false,
			items: [...new Set(books.map((b) => b.read.getFullYear()))]
				.toSorted((a, b) => b - a)
				.map((year) => {
					return {
						hideFromSidebar: false,
						title: year.toString(),
						pathname: `${Routes.BOOKS}/${year}`
					};
				})
				.concat(
					books.map((b) => ({
						title: b.title,
						pathname: `${Routes.BOOKS}/${createSlug(b.title)}`,
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
					pathname: `${Routes.AUTHORS}/${createSlug(a.name)}`
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
			? [{ crumb: secondary.title, pathname: secondary.pathname }, primary]
			: [primary];
	});
</script>

<div class="[--header-height:calc(--spacing(14))]">
	<Sidebar.Provider class="flex flex-col">
		<div class="flex flex-1">
			<AppSidebar variant="inset" {primaryItems} {activePrimary} />
			<Sidebar.Inset>
				<Header {breadcrumbs} member={nonNullMember} />
					{@render children?.()}
			</Sidebar.Inset>
		</div>
	</Sidebar.Provider>
</div>

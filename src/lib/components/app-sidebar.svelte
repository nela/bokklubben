<script lang="ts" module>
	import LifeBuoyIcon from '@lucide/svelte/icons/life-buoy';
	import SendIcon from '@lucide/svelte/icons/send';

	const library: NavItemPrimary = {
		title: 'Bibliotek',
		pathname: '/library',
		type: 'primary',
		icon: BookIcon,
		isActive: false,
		items: [
			{
				title: 'Bøker',
				type: 'secondary',
				pathname: '/library/books',
				isActive: false,
				items: [
					{
						title: '2016',
						type: 'tertiary',
						pathname: '/library/books/2016',
						isActive: false
					},
					{
						title: '2017',
						type: 'tertiary',
						pathname: '/library/books/2017',
						isActive: false
					}
				]
			},
			{
				title: 'Forfattere',
				pathname: '/library/authors',
				type: 'secondary',
				isActive: false,
				items: []
			}
		]
	};

	const members: NavItemPrimary = {
		title: 'Medlemmer',
		pathname: '/members',
		type: 'primary',
		icon: Users,
		isActive: false,
		items: [
			{
				title: 'cto',
				type: 'secondary',
				pathname: '/members/cto',
				isActive: false,
				items: []
			},
			{
				title: 'cfo',
				type: 'secondary',
				pathname: '/members/cfo',
				isActive: false,
				items: []
			}
		]
	};

	const navItems: Record<NavItemPrimaryKey, NavItemPrimary> = {
		[NavItemPrimaryKey.LIBRARY]: library,
		[NavItemPrimaryKey.MEMBERS]: members
	};

	const navItemsPrimary = [library, members];
	const navItemsBottom = [
		{
			title: 'Support',
			url: '#',
			icon: LifeBuoyIcon
		},
		{
			title: 'Feedback',
			url: '#',
			icon: SendIcon
		}
	];

	/* const activePrimaryItem = $derived(
		navItemsPrimary.find((item) => page.url.pathname.startsWith(item.pathname))
	) */

	function togglePath(item: NavItemBase) {
		if (page.url.pathname !== item.pathname) {
			item.isActive = true;
			// TODO set other items as inactive? Maybe I dont need active?
			// TODO set parents as active
			goto(item.pathname);
		}

		// go to parent

		const paths = page.url.pathname.split('/');
		console.log('paths', paths);
		paths.pop();
		const newPath = paths.reduce((acc, curr) => `${acc}/${curr}`, '/');
		console.log(newPath);
	}
</script>

<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { BookIcon, NotebookText, Scroll, Users } from '@lucide/svelte';
	import NavBottom from './nav-bottom.svelte';
	import BkIcon from './icons/bk-icon.svelte';
	import { NavItemPrimaryKey, type NavItemBase, type NavItemPrimary } from '$lib/model';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import NavItemGroup from './nav-item-group.svelte';
	import { fly, type TransitionConfig } from 'svelte/transition';

	const activePrimaryItem = $derived(
		navItemsPrimary.find((item) => page.url.pathname.startsWith(item.pathname))
	);

	const secondaryItems = $derived(activePrimaryItem?.items ?? []);
	const activeSecondaryItem = $derived(
		secondaryItems.find((i) => page.url.pathname.startsWith(i.pathname))
	);
	const tertiaryItems = $derived(activeSecondaryItem?.items ?? []);

	const subitems = $derived(
		[
			{ key: activePrimaryItem?.pathname, items: secondaryItems },
			{ key: activeSecondaryItem?.pathname, items: tertiaryItems }
		].filter((s) => s.items.length)
	);

	let { ref = $bindable(null), ...restProps }: ComponentProps<typeof Sidebar.Root> = $props();

	let subitemPrevCount: number | undefined = undefined;

	$effect(() => {
		const curr = subitems.length;

		// logic

		subitemPrevCount = curr;
	});

	import { onMount } from 'svelte';

	const offset = $derived(page.url.pathname.startsWith('/lib') ? 2.5 : 1);
</script>

<!-- <Sidebar.Root class="top-(--header-height) h-[calc(100svh-var(--header-height))]!" {...restProps}> -->
<Sidebar.Root {...restProps}>
	<Sidebar.Header>
		<Sidebar.Menu>
			<Sidebar.MenuItem>
				<Sidebar.MenuButton size="lg" class="mb-4">
					{#snippet child({ props })}
						<a href="/" {...props}>
							<div
								class="text-sidebar-primary-foreground inline-flex items-center justify-center rounded-lg"
							>
								<BkIcon class="text-primary-600 h-auto w-[clamp(2rem,8vw,5rem)]" />
							</div>
						</a>
					{/snippet}
				</Sidebar.MenuButton>
			</Sidebar.MenuItem>
		</Sidebar.Menu>
	</Sidebar.Header>
	<Sidebar.Content>
		<NavItemGroup label="Bokklubben" items={navItemsPrimary} />
		<!-- {#if secondaryItems.length} -->
		{#each subitems as { key, items }, idx (key)}
			{@const delayIn = idx + offset}
			{@const delayOut = subitems.length - 1 - idx}
			{@const baseDuration = 200}
			<!-- {@const delayIn = idx + (page.url.pathname.startsWith('/library') ? 2 : 0)} -->
			{delayIn}
			{delayOut}
			{offset}
			<div class="inline-flex flex-col justify-center gap-2 px-4 py-2">
				<hr class="h-px border-0 bg-gray-200 dark:bg-gray-700" />
			</div>
			<!-- {#key key} -->
			<!-- <div -->
			<!--   in:fly={{ x: -10, duration: baseDuration, delay: baseDuration * (delayIn) }} -->
			<!--   out:fly={{ x: -10, duration: baseDuration, delay: baseDuration * (delayOut) }} -->
			<!-- > -->
			<NavItemGroup
				transitionKey={key ?? ''}
				delayMultiplierIn={delayIn}
				delayMultiplierOut={delayOut}
				{items}
			/>
			<!-- </div> -->
			<!-- {/key} -->
		{/each}

		<!-- {/if} -->

		<!-- Block for Tertiary Items (Second level of sub-items) -->
		<!-- {#if tertiaryItems.length}
			<div class="inline-flex flex-col justify-center gap-2 px-4 py-2">
				<hr class="h-px border-0 bg-gray-200 dark:bg-gray-700" />
			</div>
			<NavItemGroup items={tertiaryItems} />
		{/if} -->

		<NavBottom items={navItemsBottom} class="mt-auto" />
	</Sidebar.Content>
	<Sidebar.Footer>
		Footer
		<!-- <NavUser user={data.user} /> -->
	</Sidebar.Footer>
</Sidebar.Root>

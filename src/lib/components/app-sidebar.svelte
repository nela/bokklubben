<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import { Separator } from '$lib/components/ui/separator';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import type { NavItemPrimary } from '$lib/model';
	import NavItemGroup from './nav-item-group.svelte';
	import BkIcon from './icons/bk-icon.svelte';
	import { Routes } from '$lib/routes';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { ChevronUp } from '@lucide/svelte';
	import type { Member } from '$lib/dto/dto';
	import { toggleMode } from 'mode-watcher';
	import * as Avatar from '$lib/components/ui/avatar';
	import { fly } from 'svelte/transition';
	import { page } from '$app/state';

	let {
		ref = $bindable(null),
		primaryItems,
		activePrimary,
		member,
		signOut,
		...restProps
	}: ComponentProps<typeof Sidebar.Root> & {
		activePrimary: NavItemPrimary | undefined;
		primaryItems: Array<NavItemPrimary>;
		member: Member;
		signOut: () => Promise<void>;
	} = $props();

	const sidebarItems = $derived(activePrimary?.items.filter((i) => !i.hideFromSidebar) ?? []);

	// A submenu can have more than one list (Bøker: by year or by genre); one is shown at a time.
	const groups = $derived([...new Set(sidebarItems.flatMap((i) => (i.group ? [i.group] : [])))]);
	// A switch made on this page; after moving to another page, that page's own list wins.
	let chosen = $state<{ group: string; pathname: string } | null>(null);
	const shownGroup = $derived.by(() => {
		if (groups.length < 2) return undefined;
		const pageGroup = sidebarItems.find((i) => page.url.pathname.startsWith(i.pathname))?.group;
		if (chosen && groups.includes(chosen.group)) {
			if (chosen.pathname === page.url.pathname || !pageGroup) return chosen.group;
		}
		return pageGroup ?? groups[0];
	});
	const otherGroup = $derived(
		shownGroup === undefined ? undefined : groups[(groups.indexOf(shownGroup) + 1) % groups.length]
	);
	const secondaryItems = $derived(
		shownGroup === undefined ? sidebarItems : sidebarItems.filter((i) => i.group === shownGroup)
	);

	const displayName = $derived(member.nickname ?? member.firstName.split(" ")[0])

	// The logo flutters once as its link is hovered or focused, and plays to the end.
	let logoFlutter = $state(false);
</script>

<Sidebar.Root collapsible="offcanvas" {...restProps}>
	<Sidebar.Header class="mt-1 mb-4">
		<Sidebar.Menu>
			<Sidebar.MenuItem>
				<Sidebar.MenuButton size="lg" class="mb-4">
					{#snippet child({ props })}
						<p {...props}>
							<a
								href={Routes.DASHBOARD}
								class="inline-flex items-center gap-3"
								onmouseenter={() => (logoFlutter = true)}
								onfocus={() => (logoFlutter = true)}
							>
								<BkIcon class="text-foreground h-8 w-8" bind:flutter={logoFlutter} />
								<span
									class="font-unbounded bg-gradient-to-br from-zinc-900 to-zinc-600 bg-clip-text text-xl font-semibold text-transparent drop-shadow-sm dark:from-zinc-200 dark:to-zinc-400"
								>
									Bokklubben
								</span>
							</a>
						</p>
					{/snippet}
				</Sidebar.MenuButton>
			</Sidebar.MenuItem>
		</Sidebar.Menu>
	</Sidebar.Header>
	<Sidebar.Content>
		<NavItemGroup items={primaryItems} />
		<!-- The submenu slides out and the next one in, also between two sections that both have
		     one (e.g. Medlemmer → Bøker) and between a section's lists (År ⇄ Sjanger). Both share
		     one grid cell, so the new one doesn't jump. -->
		<div class="grid">
			{#key `${activePrimary?.pathname}:${shownGroup}`}
				{#if secondaryItems.length > 0}
					<div
						class="[grid-area:1/1]"
						in:fly|global={{ x: -10, duration: 300, delay: 300 }}
						out:fly|global={{ x: -10, duration: 300, delay: 0 }}
					>
						<Separator orientation="horizontal" />
						<NavItemGroup
							items={secondaryItems}
							label={shownGroup}
							switchTo={shownGroup !== undefined && otherGroup !== undefined
								? {
										label: otherGroup,
										onswitch: () => (chosen = { group: otherGroup, pathname: page.url.pathname })
									}
								: undefined}
						/>
					</div>
				{/if}
			{/key}
		</div>
	</Sidebar.Content>
	<Sidebar.Footer>
		<Sidebar.Menu>
			<Sidebar.MenuItem>
				<DropdownMenu.Root>
					<DropdownMenu.Trigger>
						{#snippet child({ props })}
							<Sidebar.MenuButton
								{...props}
								class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
							>
								<Avatar.Root class="size-8 rounded-lg">
									<Avatar.Image src={member.imageUrl} alt={member.nickname ?? member.firstName} />
									<Avatar.Fallback class="rounded-lg">
										{member.firstName.charAt(0)}{member.lastName.charAt(0)}
									</Avatar.Fallback>
								</Avatar.Root>
								{displayName}
								<ChevronUp class="ml-auto" />
							</Sidebar.MenuButton>
						{/snippet}
					</DropdownMenu.Trigger>
					<DropdownMenu.Content side="top" class="w-(--bits-dropdown-menu-anchor-width)">
						{#if member.role === 'admin'}
							<DropdownMenu.Item>
								{#snippet child({ props })}
									<a href={Routes.ADMIN} {...props}>Admin</a>
								{/snippet}
							</DropdownMenu.Item>
						{/if}
						<DropdownMenu.Item onclick={toggleMode}>
							<span aria-label="Toggle mode">Toggle mode</span>
						</DropdownMenu.Item>
						<DropdownMenu.Item onclick={() => signOut()}>
							<span>Logg ut</span>
						</DropdownMenu.Item>
					</DropdownMenu.Content>
				</DropdownMenu.Root>
			</Sidebar.MenuItem>
		</Sidebar.Menu>
	</Sidebar.Footer>
</Sidebar.Root>

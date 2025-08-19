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

	let {
		ref = $bindable(null),
		primaryItems,
		activePrimary,
		member,
		...restProps
	}: ComponentProps<typeof Sidebar.Root> & {
		activePrimary: NavItemPrimary | undefined;
		primaryItems: Array<NavItemPrimary>;
		member: Member;
	} = $props();

	const secondaryItems = $derived(activePrimary?.items.filter((i) => !i.hideFromSidebar) ?? []);

	const signOut = async () => {
		await fetch('/auth/signout');
	};
</script>

<Sidebar.Root collapsible="offcanvas" {...restProps}>
	<Sidebar.Header class="mt-1 mb-4">
		<Sidebar.Menu>
			<Sidebar.MenuItem>
				<Sidebar.MenuButton size="lg" class="mb-4">
					{#snippet child({ props })}
						<p {...props}>
							<a href={Routes.DASHBOARD} class="group/bkicon inline-flex items-center gap-3">
								<BkIcon
									class="zinc-400 h-10 w-10 transition-transform duration-300 ease-in-out group-hover/bkicon:-rotate-90"
								/>
								<span
									class="font-unbounded from-zing-900 bg-gradient-to-br to-zinc-600 bg-clip-text text-lg font-semibold text-transparent drop-shadow-sm dark:from-zinc-400 dark:to-zinc-300"
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
		{#if secondaryItems.length > 0}
			<Separator orientation="horizontal" />
			<NavItemGroup items={secondaryItems} />
		{/if}
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
									<Avatar.Image src={member.imageUrl} alt={member.username ?? member.firstname} />
									<Avatar.Fallback class="rounded-lg">
										{member.firstname.charAt(0)}{member.lastname.charAt(0)}
									</Avatar.Fallback>
								</Avatar.Root>
								{member.firstname}
								<ChevronUp class="ml-auto" />
							</Sidebar.MenuButton>
						{/snippet}
					</DropdownMenu.Trigger>
					<DropdownMenu.Content side="top" class="w-(--bits-dropdown-menu-anchor-width)">
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

<script lang="ts">
	import { ArrowLeft, BookIcon, CalendarDays, Mail, PenTool, Users } from '@lucide/svelte';
	import NavItemGroup from '$lib/components/nav-item-group.svelte';
	import * as Sidebar from '$lib/components/ui/sidebar';
	import type { NavItemBase } from '$lib/model';
	import { AdminRoutes, Routes } from '$lib/routes';

	let { children } = $props();

	const items: Array<NavItemBase> = [
		{ title: 'Møter', pathname: AdminRoutes.MEETS, icon: CalendarDays, hideFromSidebar: false },
		{ title: 'Bøker', pathname: AdminRoutes.BOOKS, icon: BookIcon, hideFromSidebar: false },
		{ title: 'Forfattere', pathname: AdminRoutes.AUTHORS, icon: PenTool, hideFromSidebar: false },
		{ title: 'Medlemmer', pathname: AdminRoutes.MEMBERS, icon: Users, hideFromSidebar: false },
		{ title: 'E-post', pathname: AdminRoutes.EMAILS, icon: Mail, hideFromSidebar: false }
	];
</script>

<Sidebar.Provider>
	<Sidebar.Root collapsible="offcanvas" variant="inset">
		<Sidebar.Header>
			<h2 class="font-unbounded px-2 pt-2 text-lg font-semibold">Admin</h2>
		</Sidebar.Header>
		<Sidebar.Content>
			<NavItemGroup {items} />
		</Sidebar.Content>
		<Sidebar.Footer>
			<Sidebar.Menu>
				<Sidebar.MenuItem>
					<Sidebar.MenuButton>
						{#snippet child({ props })}
							<a href={Routes.DASHBOARD} {...props}>
								<ArrowLeft />
								<span>Til siden</span>
							</a>
						{/snippet}
					</Sidebar.MenuButton>
				</Sidebar.MenuItem>
			</Sidebar.Menu>
		</Sidebar.Footer>
	</Sidebar.Root>
	<Sidebar.Inset>
		<header class="flex h-14 shrink-0 items-center border-b px-4">
			<Sidebar.Trigger class="-ml-1" />
		</header>
		<main class="mx-auto w-full max-w-4xl p-4 md:p-8">
			{@render children()}
		</main>
	</Sidebar.Inset>
</Sidebar.Provider>

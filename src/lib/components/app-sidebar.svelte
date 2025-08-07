<script lang="ts" module>
	import LifeBuoyIcon from '@lucide/svelte/icons/life-buoy';
	import SendIcon from '@lucide/svelte/icons/send';

	const navs: {
		primary: Array<NavItem>,
		secondary: Array<NavItem>
	} = {
		primary: [
			{
				title: 'Bibliotek',
				url: '/library',
				icon: BookIcon,
			},
			{
				title: 'Medlemmer',
				url: '/members',
				icon: Users,
			},
			{
				title: 'Møter',
				url: '#',
				icon: NotebookText,
			},
			{
				title: 'Vedtekter',
				url: '#',
				icon: Scroll,
			}
		],
		secondary: [
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
		]
	};
</script>

<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import NavMain from './nav-main.svelte';
	import { BookIcon, NotebookText, Scroll, Users } from '@lucide/svelte';
	import NavBottom from './nav-bottom.svelte';
	import NavFilter from './nav-filter.svelte';
	import BkIcon from './icons/bk-icon.svelte';
	import type { NavItem } from '$lib/model';

	let { ref = $bindable(null), ...restProps }: ComponentProps<typeof Sidebar.Root> = $props();
</script>

<!-- <Sidebar.Root class="top-(--header-height) h-[calc(100svh-var(--header-height))]!" {...restProps}> -->
<Sidebar.Root {...restProps}>
	<Sidebar.Header>
		<Sidebar.Menu>
			<Sidebar.MenuItem>
				<Sidebar.MenuButton size="lg" container="fit" class="mb-4">
					{#snippet child({ props })}
						<a href="##" {...props}>
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
		<NavMain items={navs.primary} />

		<!-- divider -->
		<div class="inline-flex flex-col justify-center gap-2 px-4 py-2">
			<hr class="h-px border-0 bg-gray-200 dark:bg-gray-700" />
		</div>

		<NavFilter />
		<NavBottom items={navs.secondary} class="mt-auto" />
	</Sidebar.Content>
	<Sidebar.Footer>
		Footer
		<!-- <NavUser user={data.user} /> -->
	</Sidebar.Footer>
</Sidebar.Root>

<script lang="ts" module>
	import LifeBuoyIcon from '@lucide/svelte/icons/life-buoy';
	import SendIcon from '@lucide/svelte/icons/send';
	import FrameIcon from '@lucide/svelte/icons/frame';
	import PieChartIcon from '@lucide/svelte/icons/pie-chart';
	import MapIcon from '@lucide/svelte/icons/map';
	import CommandIcon from '@lucide/svelte/icons/command';

	// let { data, children }: LayoutProps = $props();

	const navMain = {
		user: {
			name: 'shadcn',
			email: 'm@example.com',
			avatar: '/avatars/shadcn.jpg'
		},
		navMain: [
			{
				title: 'Bibliotek',
				url: '/library',
				icon: BookIcon,
				isActive: true,
				items: []
			},
			{
				title: 'Medlemmer',
				url: '/members',
				// icon: BotIcon,
				icon: Users,
				items: []
			},
			{
				title: 'Møter',
				url: '#',
				icon: NotebookText,
				items: []
			},
			{
				title: 'Vedtekter',
				url: '#',
				icon: Scroll,
				items: []
			}
		],
		/* projects: [
      {
        name: "Design Engineering",
        url: "#",
        icon: FrameIcon,
      },
      {
        name: "Sales & Marketing",
        url: "#",
        icon: PieChartIcon,
      },
      {
        name: "Travel",
        url: "#",
        icon: MapIcon,
      },
    ], */
		navSecondary: [
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

	let {
		ref = $bindable(null),
		...restProps
	}: ComponentProps<typeof Sidebar.Root>  = $props();
  /* & {
      filters: Array<{
        name: string;
        url: string;
      }>;
    } */
</script>

<Sidebar.Root class="top-(--header-height) h-[calc(100svh-var(--header-height))]!" {...restProps}>
	<Sidebar.Header>
		<Sidebar.Menu>
			<Sidebar.MenuItem>
				<Sidebar.MenuButton size="lg">
					{#snippet child({ props })}
						<a href="##" {...props}>
							<div
								class="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg"
							>
								<CommandIcon class="size-4" />
							</div>
							<div class="grid flex-1 text-left text-sm leading-tight">
								<span class="truncate font-medium">Acme Inc</span>
								<span class="truncate text-xs">Enterprise</span>
							</div>
						</a>
					{/snippet}
				</Sidebar.MenuButton>
			</Sidebar.MenuItem>
		</Sidebar.Menu>
	</Sidebar.Header>
	<Sidebar.Content>
		<NavMain items={navMain.navMain} />

		<div class="inline-flex flex-col justify-center gap-2 px-4 py-2">
			<hr class="h-px border-0 bg-gray-200 dark:bg-gray-700" />
		</div>

		<NavFilter />
		<NavBottom items={navMain.navSecondary} class="mt-auto" />
	</Sidebar.Content>
	<Sidebar.Footer>
		Footer
		<!-- <NavUser user={data.user} /> -->
	</Sidebar.Footer>
</Sidebar.Root>

<script lang="ts">
	import type { LayoutProps } from './$types';
	import BkIcon from '$lib/components/icons/bk-icon.svelte';
	import * as NavigationMenu from '$lib/components/ui/navigation-menu/index.js';
	import { Menu, Moon, Sun } from '@lucide/svelte';
	import * as Sheet from '$lib/components/ui/sheet';
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import * as Sidebar from '$lib/components/ui/sidebar/index';
	import { Provider } from '$lib/components/ui/tooltip';
	import AppSidebar from '$lib/components/app-sidebar.svelte';
	import Header from '$lib/components/header.svelte';
	import { page } from '$app/state';
	import { onDestroy, setContext } from 'svelte';
	import { ClubTitle } from '$lib/dto/dto';

	const navs = {
		book: { name: 'Bøker', ref: '/book/list' },
		member: { name: 'Medlemmer', ref: '/member/list' },
		meet: { name: 'Møter', ref: '/meet/list' },
		protocol: { name: 'Protokoll', ref: '/protokoll' }
	};

	let { data, children }: LayoutProps = $props();
	const member = data.member!;
	const displayName = $derived(
		member.username ? member.username : `${member.firstname} ${member.lastname}`
	);

	const pathConfigs = [
		{
			path: '/library',
			key: 'library',
			getValue: () => [
				{ name: 'bok1', url: '#' },
				{ name: 'bok2', url: '#' }
			]
		},
		{
			path: '/members',
			key: 'members',
			// Assuming `data` is available from `export let data`
			getValue: () => {
				if (!data?.allMembers) return [];
				const titles = [...new Set(data.allMembers.flatMap((member) => member.titles))].map(
					(t) => ({
						name: ClubTitle[t as keyof typeof ClubTitle],
						url: '#'
					})
				);
				return titles;
			}
		},
		{
			path: '/somethingelse',
			key: 'somethingelse',
			getValue: () => []
		}
	];

	const filterNav = $derived.by(() => {
		const config = pathConfigs.find((c) => page.url.pathname.startsWith(c.path));

		return config
			? {
					key: config.key,
					value: config.getValue()
				}
			: { key: '', value: [] as Array<any> };
	});

	setContext('filter-nav', () => filterNav);
</script>

<div class="[--header-height:calc(--spacing(14))]">
	<Sidebar.Provider class="flex flex-col">
		<Header />
		<div class="flex flex-1">
			<AppSidebar />
			<Sidebar.Inset>
				{@render children?.()}
				<!-- <div class="flex flex-1 flex-col gap-4 p-4"> -->
				<!--   <div class="grid auto-rows-min gap-4 md:grid-cols-3"> -->
				<!--     <div class="bg-muted/50 aspect-video rounded-xl"></div> -->
				<!--     <div class="bg-muted/50 aspect-video rounded-xl"></div> -->
				<!--     <div class="bg-muted/50 aspect-video rounded-xl"></div> -->
				<!--   </div> -->
				<!--   <div class="bg-muted/50 min-h-[100vh] flex-1 rounded-xl md:min-h-min"></div> -->
				<!-- </div> -->
			</Sidebar.Inset>
		</div>
	</Sidebar.Provider>
</div>

<script lang="ts">
	import { getContext, type Component } from 'svelte';
	import EllipsisIcon from '@lucide/svelte/icons/ellipsis';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { fade, fly } from 'svelte/transition';

	// let {
	//   filters,
	// }: {
	//   filters: {
	//     name: string;
	//     url: string;
	//     // icon: Component;
	//   }[];
	// } = $props();
	const filters = getContext('filter-nav') as () => {
		key: string;
		value: Array<{ name: string; url: string }>;
	};
	const first = filters();
	console.log('filters', first);
	const sidebar = Sidebar.useSidebar();
</script>

<Sidebar.Group class="group-data-[collapsible=icon]:hidden">
	<!-- <Sidebar.GroupLabel>Projects</Sidebar.GroupLabel> -->

	<Sidebar.Menu>
		{#key filters().key}
			<div in:fly={{ x: -20, duration: 300, delay: 200 }} out:fly={{ x: -20, duration: 200 }}>
				{#each filters().value as item (item.name)}
					<Sidebar.MenuItem>
						<Sidebar.MenuButton>
							{#snippet child({ props })}
								<a href={item.url} {...props}>
									<!-- <item.icon /> -->
									<span>{item.name}</span>
								</a>
							{/snippet}
						</Sidebar.MenuButton>
					</Sidebar.MenuItem>
				{/each}
				<Sidebar.MenuItem>
					<Sidebar.MenuButton>
						<EllipsisIcon />
						<span>More</span>
					</Sidebar.MenuButton>
				</Sidebar.MenuItem>
			</div>
		{/key}
	</Sidebar.Menu>
</Sidebar.Group>

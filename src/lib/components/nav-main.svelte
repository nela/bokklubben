<script lang="ts">
	import type { Component } from 'svelte';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';

	let {
		items
	}: {
		items: {
			title: string;
			url: string;
			icon: Component;
			isActive?: boolean;
			items?: {
				title: string;
				url: string;
			}[];
		}[];
	} = $props();
</script>

<Sidebar.Group>
	<Sidebar.GroupLabel>Platform</Sidebar.GroupLabel>
	<Sidebar.GroupContent>
		<Sidebar.Menu>
			{#each items as item (item.title)}
				<Sidebar.MenuItem>
					<Sidebar.MenuButton tooltipContent={item.title}>
						{#snippet child({ props })}
						<a href={item.url} {...props}>
						  <item.icon />
						  <span>{item.title}</span>
						</a>
						{/snippet}
					</Sidebar.MenuButton>
					{#if item.items?.length}
						<Sidebar.MenuAction class="data-:rotate-90">
						</Sidebar.MenuAction>
					{/if}
				</Sidebar.MenuItem>
			{/each}
		</Sidebar.Menu>
	</Sidebar.GroupContent>
</Sidebar.Group>

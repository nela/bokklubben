<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { page } from '$app/state';
	import type { NavItem } from '$lib/model';

	let {
		items
	}: {
		items: Array<NavItem>
	} = $props();

</script>

<Sidebar.Group>
	<Sidebar.GroupLabel>Bokklubben</Sidebar.GroupLabel>
	<Sidebar.GroupContent>
		<Sidebar.Menu>
			{#each items as item (item.title)}
				<Sidebar.MenuItem>
					<Sidebar.MenuButton isActive={page.url.pathname.startsWith(item.url)} tooltipContent={item.title}>
						{#snippet child({ props })}
						<a href={item.url} {...props}>
						  <item.icon />
						  <span>{item.title}</span>
						</a>
						{/snippet}
					</Sidebar.MenuButton>
				</Sidebar.MenuItem>
			{/each}
		</Sidebar.Menu>
	</Sidebar.GroupContent>
</Sidebar.Group>

<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { page } from '$app/state';
	import type { NavItem } from '$lib/model';

	let {
		label,
		items
	}: {
		label?: string;
		items: Array<NavItem>;
	} = $props();
</script>

<Sidebar.Group>
	{#if label}
		<Sidebar.GroupLabel>{label}</Sidebar.GroupLabel>
	{/if}
	<Sidebar.GroupContent>
		<Sidebar.Menu>
			{#each items as item (item.title)}
				<Sidebar.MenuItem>
					<Sidebar.MenuButton
						isActive={page.url.pathname.includes(item.pathname)}
						tooltipContent={item.title}
					>
						{#snippet child({ props })}
							<a href={item.pathname === '/library' ? '/library/books' : item.pathname} {...props}>
								{#if 'icon' in item}
									<item.icon />
								{/if}
								<span>{item.title}</span>
							</a>
						{/snippet}
					</Sidebar.MenuButton>
				</Sidebar.MenuItem>
			{/each}
		</Sidebar.Menu>
	</Sidebar.GroupContent>
</Sidebar.Group>

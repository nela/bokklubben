<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { page } from '$app/state';
	import type { NavItem, NavItemPrimary, NavItemPrimaryKey, NavItemSecondary } from '$lib/model';
	import { goto } from '$app/navigation';

	let {
		items
	}: {
		items: Array<NavItem>
	} = $props();


	function togglePath(item: NavItem) {
		console.log('')
		if (page.url.pathname !== item.pathname) {
				item.isActive = true;
				// TODO set other items as inactive? Maybe I dont need active?
				// TODO set parents as active
				return goto(item.pathname);
		}

		if (item.type !== 'tertiary') {
			return goto('/')
		}

		console.log('curr path', page.url.pathname);
		console.log('item path', item.pathname);
		const paths = page.url.pathname.split('/').filter((p) => p !== '')
		console.log('paths', paths);
		paths.pop()
		console.log('paths popped', paths);
		const newPath = paths.join('/')
		// paths.pop()
		// const newPath = paths.reduce((acc, curr, index) => index < paths.length - 1 ? `${acc}/${curr}` : acc, '/');
		console.log('newPath', `/${newPath}`);
		goto(`/${newPath}`);
	}

</script>

<Sidebar.Group>
	<Sidebar.GroupLabel>Bokklubben</Sidebar.GroupLabel>
	<Sidebar.GroupContent>
		<Sidebar.Menu>
			{#each items as item (item.title)}
				<Sidebar.MenuItem>
					<Sidebar.MenuButton onclick={() => togglePath(item)} isActive={page.url.pathname.includes(item.pathname)} tooltipContent={item.title}>
						{#snippet child({ props })}
						<!-- <a href={item.pathname} {...props}> -->
							<a  {...props} >
						  <!-- <item.icon /> -->
						  <span>{item.title}</span>
						</a>
						{/snippet}
					</Sidebar.MenuButton>
				</Sidebar.MenuItem>
			{/each}
		</Sidebar.Menu>
	</Sidebar.GroupContent>
</Sidebar.Group>

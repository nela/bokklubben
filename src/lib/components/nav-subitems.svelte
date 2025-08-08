<!---->
<!-- <script lang="ts"> -->
<!-- 	import { getContext } from 'svelte'; -->
<!-- 	import * as Sidebar from '$lib/components/ui/sidebar/index.js'; -->
<!-- 	import { fly } from 'svelte/transition'; -->
<!-- 	import type { NavItemBase, NavItemSecondary } from '$lib/model'; -->
<!---->
<!-- 	let { -->
<!-- 		items -->
<!-- 	}: { -->
<!-- 		items: Array<NavItemBase> -->
<!-- 	} = $props(); -->
<!---->
<!-- </script> -->
<!---->
<!-- <Sidebar.Group class="group-data-[collapsible=icon]:hidden"> -->
<!-- 	<Sidebar.Menu> -->
<!-- 		{#key filters().key} -->
<!-- 			<div in:fly={{ x: -20, duration: 300, delay: 200 }} out:fly={{ x: -20, duration: 200 }}> -->
<!-- 				{#each filters().value as item (item.name)} -->
<!-- 					<Sidebar.MenuItem> -->
<!-- 						<Sidebar.MenuButton> -->
<!-- 							{#snippet child({ props })} -->
<!-- 								<a href={item.url} {...props}> -->
<!-- 									<!-- <item.icon /> --> -->
<!-- 									<span>{item.name}</span> -->
<!-- 								</a> -->
<!-- 							{/snippet} -->
<!-- 						</Sidebar.MenuButton> -->
<!-- 					</Sidebar.MenuItem> -->
<!-- 				{/each} -->
<!-- 			</div> -->
<!-- 		{/key} -->
<!-- 	</Sidebar.Menu> -->
<!-- </Sidebar.Group> -->

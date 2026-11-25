<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { page } from '$app/state';
	import type { NavItem } from '$lib/model';
	import { ArrowLeftRight } from '@lucide/svelte';
	import { cn } from '$lib/utils/shadcn';

	let {
		label,
		items,
		switchTo
	}: {
		label?: string;
		items: Array<NavItem>;
		/** Makes the label a button that switches to another list: its heading and what it does. */
		switchTo?: { label: string; onswitch: () => void };
	} = $props();
</script>

<Sidebar.Group>
	{#if label && switchTo}
		<Sidebar.GroupLabel>
			{#snippet child({ props })}
				<button
					type="button"
					{...props}
					class={cn(
						props.class as string,
						'hover:text-sidebar-foreground w-fit cursor-pointer gap-1.5 text-[13px]'
					)}
					title={`Vis ${switchTo.label.toLowerCase()}`}
					onclick={switchTo.onswitch}
				>
					{label}
					<ArrowLeftRight class="!size-3" />
					<span class="sr-only">(vis {switchTo.label.toLowerCase()})</span>
				</button>
			{/snippet}
		</Sidebar.GroupLabel>
	{:else if label}
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
							<a class="font-montserrat" href={item.pathname} {...props}>
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

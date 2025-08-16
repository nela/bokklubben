<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar';
	import { Separator } from '$lib/components/ui/separator';
	import * as Breadcrumb from '$lib/components/ui/breadcrumb';
	import { Button } from '$lib/components/ui/button/';
	import GithubIcon from './icons/github-icon.svelte';
	import type { Member } from '$lib/dto/dto';

	let {
		breadcrumbs,
		member
	}: {
		breadcrumbs: Array<{ crumb: string; pathname: string }>;
		member: Member;
	} = $props();

</script>

<header
	class="transition-width,height flex h-(--header-height) shrink-0 items-center gap-2 border-b ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)"
>
	<div class="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
		<Sidebar.Trigger class="-ml-1" />
		<Separator orientation="vertical" class="mx-2 data-[orientation=vertical]:h-4" />
		<Breadcrumb.Root class="hidden sm:block">
			{#if breadcrumbs.length > 0}
				<Breadcrumb.List>
					{#each breadcrumbs as { crumb, pathname }, idx (pathname)}
						{@const hasChildren = breadcrumbs.length !== idx + 1}
						<Breadcrumb.Item>
							{#if hasChildren}
								<Breadcrumb.Link href={pathname}>{crumb}</Breadcrumb.Link>
							{:else}
								<Breadcrumb.Page>{crumb}</Breadcrumb.Page>
							{/if}
						</Breadcrumb.Item>
						{#if hasChildren}
							<Breadcrumb.Separator />
						{/if}
					{/each}
				</Breadcrumb.List>
			{/if}
		</Breadcrumb.Root>
		<div class="ml-auto flex items-center gap-2">
			<Button
				href="https://github.com/nela/bokklubben.git"
				variant="ghost"
				size="lg"
				class="dark:text-foreground hidden sm:flex mr-8"
				target="_blank"
				rel="noopener noreferrer"
			>
				<GithubIcon />
			</Button>
		</div>
	</div>
</header>

<script lang="ts">
	import type { LayoutProps } from './$types';
	import BkIcon from '$lib/components/icons/bk-icon.svelte';
	import * as NavigationMenu from '$lib/components/ui/navigation-menu/index.js';
	import { Menu, Moon, Sun } from '@lucide/svelte';
	import * as Sheet from '$lib/components/ui/sheet';
	import { Button, buttonVariants } from '$lib/components/ui/button';

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
</script>

<header class="bg-background sticky top-0 z-10 flex h-16 items-center border-b px-4 md:px-6">
	<!-- Desktop Header -->
	<div class="hidden w-full items-center justify-between md:flex">
		<!-- Left-aligned navigation -->
		<div class="flex items-center gap-6">
			<a href="/" class="flex items-center gap-2">
				<BkIcon width={22} height={18} />
				<span class="text-lg font-bold">Bokklubben</span>
			</a>
			<div class="bg-muted h-6 w-px"></div>
			<nav class="flex items-center gap-6">
				<NavigationMenu.Root>
					<NavigationMenu.List>
						<NavigationMenu.Item>
							<NavigationMenu.Link href={navs.book.ref}>{navs.book.name}</NavigationMenu.Link>
						</NavigationMenu.Item>
						<NavigationMenu.Item>
							<NavigationMenu.Link href={navs.member.ref}>{navs.member.name}</NavigationMenu.Link>
						</NavigationMenu.Item>
						<NavigationMenu.Item>
							<NavigationMenu.Link href={navs.meet.ref}>{navs.meet.name}</NavigationMenu.Link>
						</NavigationMenu.Item>
						<NavigationMenu.Item>
							<NavigationMenu.Link href={navs.protocol.ref}>{navs.protocol.name}</NavigationMenu.Link>
						</NavigationMenu.Item>
					</NavigationMenu.List>
				</NavigationMenu.Root>
			</nav>
		</div>

		<!-- Right-aligned profile menu (Desktop) -->
		<NavigationMenu.Root>
			<NavigationMenu.List>
				<NavigationMenu.Item>
					<NavigationMenu.Trigger>{displayName}</NavigationMenu.Trigger>
					<NavigationMenu.Content>
						<ul class="w-[150px] p-2">
							<li>
								<button
									class="hover:bg-accent flex w-full items-center justify-between rounded-md p-2 text-left"
								>
									<span>Toggle theme</span>
									<div class="relative h-4 w-4">
										<Sun
											class="absolute h-full w-full scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90"
										/>
										<Moon
											class="absolute h-full w-full scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0"
										/>
									</div>
								</button>
							</li>
							<li>
								<a
									href="/profile/details"
									class="hover:bg-accent block w-full rounded-md p-2 text-left"
								>
									Detaljer
								</a>
							</li>
							<li>
								<form action="/logout" method="POST" class="w-full">
									<button type="submit" class="hover:bg-accent w-full rounded-md p-2 text-left">
										Logg ut
									</button>
								</form>
							</li>
						</ul>
					</NavigationMenu.Content>
				</NavigationMenu.Item>
			</NavigationMenu.List>
		</NavigationMenu.Root>
	</div>

	<!-- Mobile Header -->
	<div class="relative flex w-full items-center justify-between md:hidden">
		<!-- Hamburger Menu (Left) -->
		<Sheet.Root>
			<Sheet.Trigger class={buttonVariants({ variant: 'outline', size: 'icon' })}>
				<Menu class="h-5 w-5" />
				<span class="sr-only">Toggle navigation menu</span>
			</Sheet.Trigger>
			<Sheet.Content side="left" class="flex flex-col">
				<Sheet.Header>
					<Sheet.Title>Bokklubben</Sheet.Title>
				</Sheet.Header>
				<nav class="grid flex-1 gap-2 py-4 text-lg">
					<a href={navs.book.ref} class="hover:bg-accent block rounded-md p-2">{navs.book.name}</a>
					<a href={navs.member.ref} class="hover:bg-accent block rounded-md p-2">{navs.member.name}</a>
					<a href={navs.meet.ref} class="hover:bg-accent block rounded-md p-2">{navs.protocol.name}</a>
					<a href={navs.protocol.ref} class="hover:bg-accent block rounded-md p-2">{navs.protocol.name}</a>
					<a href="/profile/details" class="hover:bg-accent block rounded-md p-2">Profil</a>
				</nav>
				<div class="mt-auto">
					<form action="/logout" method="POST" class="w-full">
						<button class="hover:bg-accent w-full rounded-md border p-2 text-left">Logg ut</button>
					</form>
				</div>
			</Sheet.Content>
		</Sheet.Root>

		<!-- Logo (Center) -->
		<a href="/" class="absolute left-1/2 -translate-x-1/2">
			<BkIcon width={22} height={18} />
		</a>

		<!-- Theme Toggle (Right) -->
		<button class={buttonVariants({ variant: 'outline', size: 'icon' })}>
			<Sun
				class="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90"
			/>
			<Moon
				class="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0"
			/>
			<span class="sr-only">Toggle theme</span>
		</button>
	</div>
</header>

<main class="flex-1 p-6">
	{@render children?.()}
</main>


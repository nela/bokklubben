


<script lang="ts">
	import BkIcon from '$lib/components/icons/bk-icon.svelte';
import * as NavigationMenu from '$lib/components/ui/navigation-menu/index.js';
	import * as Sheet from '$lib/components/ui/sheet/index.js';
	import { Menu, Moon, Sun } from '@lucide/svelte';
</script>


<header
	class="sticky top-0 flex h-16 items-center justify-between gap-4 border-b bg-background px-4 md:px-6"
>
	<!-- Left-aligned navigation -->
	<div class="flex items-center gap-6">
    <BkIcon width={22} height={18} />
		<a href="/" class="text-lg font-bold">Bokklubben</a>
		<div class="h-6 w-px bg-muted"></div>
		<NavigationMenu.Root>
			<NavigationMenu.List>
				<NavigationMenu.Item>
					<NavigationMenu.Link href="/books">Books</NavigationMenu.Link>
				</NavigationMenu.Item>
				<NavigationMenu.Item>
					<NavigationMenu.Link href="/medlemmer">Medlemmer</NavigationMenu.Link>
				</NavigationMenu.Item>
				<NavigationMenu.Item>
					<NavigationMenu.Link href="/meets">Meets</NavigationMenu.Link>
				</NavigationMenu.Item>
				<NavigationMenu.Item>
					<NavigationMenu.Link href="/protokoll">Protokoll</NavigationMenu.Link>
				</NavigationMenu.Item>
			</NavigationMenu.List>
		</NavigationMenu.Root>
	</div>

	<!-- Right-aligned profile menu -->
	<NavigationMenu.Root>
		<NavigationMenu.List>
			<NavigationMenu.Item>
				<NavigationMenu.Trigger>Profile</NavigationMenu.Trigger>
				<NavigationMenu.Content>
					<ul class="p-2 w-[150px]">
						<li>
							<!-- <button class="w-full text-left p-2 rounded-md hover:bg-accent flex items-center justify-between"> -->
							<!-- 	<span>Toggle theme</span> -->
								<div class="relative h-4 w-4">
									<Sun class="absolute h-full w-full rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
									<Moon class="absolute h-full w-full rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
								</div>
							<!-- </button> -->
						</li>
						<li>
							<a href="/profile/details" class="block w-full text-left p-2 rounded-md hover:bg-accent">
								Details
							</a>
						</li>
						<li>
							<form action="/logout" method="POST" class="w-full">
								<button type="submit" class="w-full text-left p-2 rounded-md hover:bg-accent">
									Log out
								</button>
							</form>
						</li>
					</ul>
				</NavigationMenu.Content>
			</NavigationMenu.Item>
		</NavigationMenu.List>
	</NavigationMenu.Root>
</header>

<main class="flex-1 p-6">
	<slot />
</main>

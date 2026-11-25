import type { Component } from 'svelte';

export type NavItemType = 'primary' | 'secondary';

export type NavItemBase = {
	title: string;
	pathname: string;
	hideFromSidebar: boolean;
	icon?: Component;
	/**
	 * The heading of the list this item is in, for a submenu with more than one (Bøker: by year
	 * or by genre). The sidebar shows one list at a time and lets you switch between them.
	 */
	group?: string;
};

export interface NavItemPrimary extends NavItemBase {
	items: Array<NavItemBase>;
	icon: Component;
}

export type NavItem = NavItemBase | NavItemPrimary;

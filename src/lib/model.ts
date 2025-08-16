import type { Component } from 'svelte';

export type NavItemType = 'primary' | 'secondary';

export type NavItemBase = {
	title: string;
	pathname: string;
	hideFromSidebar: boolean;
	icon?: Component;
};

export interface NavItemPrimary extends NavItemBase {
	items: Array<NavItemBase>;
	icon: Component;
};

export type NavItem = NavItemBase | NavItemPrimary;

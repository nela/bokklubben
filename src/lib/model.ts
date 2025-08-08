import type { Component } from 'svelte';

export type NavItemType = 'primary' | 'secondary' | 'tertiary'

export type NavItemBase = {
	type: NavItemType
	title: string;
	pathname: string;
	isActive?: boolean;
};

/* export interface NavItemSecondary = NavItemBase & {
	items: Array<NavItemBase>;
}; */

export interface NavItemSecondary extends NavItemBase {
	items: Array<NavItemBase>
}

export interface NavItemPrimary extends NavItemSecondary {
	items: Array<NavItemSecondary>;
	icon: Component;
};

export enum NavItemPrimaryKey {
	LIBRARY,
	MEMBERS
	// MEETS,
	// REGULATIONS
}

export type NavItem = NavItemBase | NavItemPrimary| NavItemSecondary

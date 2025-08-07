import type { Component } from "svelte";

	export interface NavItem {
		title: string,
		url: string,
		icon: Component,
		isActive?: boolean
	}

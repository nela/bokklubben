<script lang="ts">
	import type { Member } from '$lib/dto/dto';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import { CalendarCheck2, Crown, User } from '@lucide/svelte';
	import type { PageProps } from './$types';

	const { data, params }: PageProps = $props();
	const { member } = data;

	const getDisplayName = (m: Member) =>
		m.username ? `${m.firstname} '${m.username}' ${m.lastname}` : `${m.firstname} ${m.lastname}`;

	const nnMember = member!;
</script>

<!-- <Card.Root class="w-full p-6"> -->
<!-- 	<div class="flex flex-col items-center gap-6 text-center md:flex-row md:items-start md:text-left"> -->
<!-- 		<img -->
<!-- 			src={nnMember.imageUrl} -->
<!-- 			alt={getDisplayName(nnMember)} -->
<!-- 			class="aspect-square h-48 w-48 flex-shrink-0 rounded-lg object-cover shadow-md" -->
<!-- 		/> -->
<!---->
<!-- 		<div class="flex-1 space-y-4"> -->
<!-- 			<div class="flex items-center justify-center gap-2 md:justify-start"> -->
<!-- 				<User class="text-muted-foreground h-6 w-6" /> -->
<!-- 				<h1 class="text-2 lxl font-bold">{getDisplayName(nnMember)}</h1> -->
<!-- 			</div> -->
<!---->
<!-- 			{#if nnMember.titles && nnMember.titles.length > 0} -->
<!-- 				<div class="flex items-start justify-center gap-3 md:justify-start"> -->
<!-- 					<Crown class="text-muted-foreground h-5 w-5 flex-shrink-0" /> -->
<!-- 					<div class="flex flex-wrap justify-center gap-2 md:justify-start"> -->
<!-- 						{#each nnMember.titles as title} -->
<!-- 							<Badge variant="secondary">{title}</Badge> -->
<!-- 						{/each} -->
<!-- 					</div> -->
<!-- 				</div> -->
<!-- 			{/if} -->
<!---->
<!-- 			<div class="text-muted-foreground flex items-center justify-center gap-3 text-sm md:justify-start"> -->
<!-- 				<CalendarCheck2 class="h-4 w-4 flex-shrink-0" /> -->
<!-- 				<div> -->
<!-- 					<p >Member since: {new Date(nnMember.memberSince).toLocaleDateString()}</p> -->
<!-- 					{#if nnMember.memberTo} -->
<!-- 						<p>Member until: {new Date(nnMember.memberTo).toLocaleDateString()}</p> -->
<!-- 					{/if} -->
<!-- 				</div> -->
<!-- 			</div> -->
<!-- 		</div> -->
<!-- 	</div> -->
<!-- </Card.Root> -->
<!---->

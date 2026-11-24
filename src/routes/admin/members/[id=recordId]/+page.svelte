<script lang="ts">
	import { failedForm } from '$lib/components/admin/form-values';
	import MemberForm from '$lib/components/admin/member-form.svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
</script>

<h1 class="mb-6 text-2xl font-semibold">{data.member.firstName} {data.member.lastName}</h1>

<MemberForm member={data.member} form={failedForm(form)} />

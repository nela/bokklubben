<script lang="ts">
	import Login from '$lib/components/login/login.svelte';
	import { auth } from '$lib/firebase.client';
	import { performAuth } from '$lib/utils/auth/auth';
</script>

<Login {auth} {performAuth} />

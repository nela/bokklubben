<script lang="ts">
	import Login from '$lib/components/login/Login.svelte';
	import { auth } from '$lib/firebase.client';
	import { createLoginHandler } from '$lib/handlers/login';

	const handler = createLoginHandler(auth);
</script>

<Login {handler} />

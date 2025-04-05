<script lang="ts">
	import Login from '$lib/components/login/login.svelte';
	import { auth } from '$lib/firebase.client';
	import { signIn } from '$lib/utils/auth/auth';
</script>

<Login {auth} {signIn} />

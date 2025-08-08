<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import { isFirstLoad } from '$lib/stores/nav';

	// Runs once on client after hydration
	afterNavigate(({ from }) => {
		if (from === null) {
			// microtask avoids clashing with any intros running this tick
			queueMicrotask(() => isFirstLoad.set(false));
		}
	});
</script>

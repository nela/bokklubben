<svelte:options css="injected" />

<script lang="ts">
	import BkIcon from './icons/bk-icon.svelte';

	/**
	 * The frame around an email to a member: the text (already filled in), a button and the logo.
	 * Rendered on the server; see $lib/server/services/member-email and password-reset.
	 */
	let {
		paragraphs,
		button = { label: 'Gå til Bokklubben', url: 'https://bokklubben.eu' }
	}: {
		/** Each paragraph as its lines. Rendered as text, so it can't add HTML. */
		paragraphs: Array<Array<string>>;
		/** The button under the text; to the site unless given. */
		button?: { label: string; url: string };
	} = $props();
</script>

<div class="container">
	{#each paragraphs as lines, i (i)}
		<p>
			{#each lines as line, j (j)}
				{line}{#if j < lines.length - 1}<br />{/if}
			{/each}
		</p>
	{/each}
	<a href={button.url} class="btn">{button.label}</a>
	<BkIcon class="width=50 height=50" />
</div>

<style>
	/* Hex colours: many email clients don't support oklch(). */
	.container {
		font-family: 'Montserrat Variable', Helvetica, Arial, sans-serif;
		max-width: 600px;
		margin: 0 auto;
		background-color: #ffffff;
		padding: 20px;
		border-radius: 10px;
		text-align: left;
	}
	p {
		color: #3f3f46;
		line-height: 1.6;
	}
	.btn {
		display: inline-block;
		background-color: #18181b;
		color: #fafafa;
		text-decoration: none;
		padding: 10px 20px;
		border-radius: 5px;
		font-size: 16px;
		margin: 12px 0 20px;
	}
</style>

<svelte:options css="injected" />

<script lang="ts">
	export let seed: string;
</script>

<div class="container">
	<h1>Velkommen til den beste bokklubben i universet!</h1>
	<p>Kjære bokelsker,</p>
	<p>
		Vi er glade for å invitere deg til å bli medlem i vårt fellesskap av bokentusiaster. Her vil du
		få tilgang til spennende anbefalinger, diskusjoner og mye mer!
	</p>
	<p>For å bli med, trykk på knappen nedenfor og registrer deg på nettsiden vår.</p>
	<a href="http://localhost:5173/register?s={seed}" class="btn">Registrer deg her!</a>
	<p>Vi gleder oss til å ha deg med!</p>
	<p>Med vennlig hilsen,<br />Bokklubben</p>
</div>

<style>
	.container {
		font-family: Arial, sans-serif;
		background-color: #f9f9f9;
		margin: 0;
		padding: 20px;

		max-width: 600px;
		margin: 0 auto;
		background-color: #ffffff;
		padding: 20px;
		border-radius: 8px;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		text-align: center;
	}
	h1 {
		color: #333333;
	}
	p {
		color: #555555;
		line-height: 1.6;
	}
	.btn {
		display: inline-block;
		background-color: #007bff;
		color: #ffffff;
		text-decoration: none;
		padding: 10px 20px;
		border-radius: 5px;
		font-size: 16px;
		margin-top: 20px;
	}
	.btn:hover {
		background-color: #0056b3;
	}
</style>

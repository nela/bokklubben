<script>
	import BkIcon from "./icons/bk-icon.svelte";

</script>
<svelte:options css="injected" />

<div class="container">
	<h1>Invitasjon til Bokklubbens <strong class="bold">EKTE</strong> nettside</h1>
	<p>Kjære medlem,</p>
	<p>
		Med en stor takk til Byråkraten, som har holdt i en alpha versjon av bokklubbens nettside,
		inviterer jeg deg til å registrere deg på Bokklubbens
		<strong class="bold">EKTE </strong>
		nettside,
		skapt med øl, svette og tårer av Bokklubbens rettsmessige CTO.
	</p>
	<p>
		Her får du god oversikt over våre aktiviteter, presentert i sexy UI, og et merkverdig domene som er lett å huske.
    Trykk på knappen nedenfor, for å bli med i Bokklubbens digitale æra.
  </p>
	<a href="http://localhost:5173/auth" class="btn">Registrer deg her!</a>
	<p>Med vennlig hilsen,<br />Nemænsje, CTO</p>
	<BkIcon class="width=50 height=50"/>
</div>

<style>
  .bold {
    font-weight: 900;
  }
	.container {
		font-family: 'Montserrat Variable', sans-serif;
		max-width: 600px;
		margin: 0 auto;
		background-color: oklch(1 0 0);
		padding: 20px;
		border-radius: 0.625rem;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		text-align: left;
	}
	h1 {
		color: oklch(0.141 0.005 285.823);
	}
	p {
		color: oklch(0.552 0.016 285.938);
		line-height: 1.6;
	}
	.btn {
		display: inline-block;
		background-color: oklch(0.21 0.006 285.885);
		color: oklch(0.985 0 0);
		text-decoration: none;
		padding: 10px 20px;
		border-radius: 5px;
		font-size: 16px;
		margin-top: 20px;
	}
	.btn:hover {
		background-color: oklch(0.18 0.006 285.885);
	}
</style>

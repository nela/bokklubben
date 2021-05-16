<script>
	import {fade, fly} from 'svelte/transition';
 	// import { cubicOut } from "svelte/easing";

	import App from "./App.svelte";

	export let name;
	let username;
	let email;
	let passw;
	let tlf;

	const options = {LOGIN: 'login', APPLY: 'apply', NONE: 'none'}

	let displayForm = options.NONE;

	function handleDisplay(cur_disp) {
		console.log("inside")
		if (displayForm === cur_disp) {
			displayForm = options.NONE;
			console.log("inside2");
		} else {
			displayForm = cur_disp;
			console.log("here");
		}
	}
/*
	function flyModified(
			node,
			{
				delay = 0,
				duration = 400,
				easing = cubicOut,
				x = 0,
				y = 0,
				position = "absolute"
			}
	) {
		const style = getComputedStyle(node);
		const opacity = +style.opacity;
		const transform = style.transform === "none" ? "" : style.transform;

		return {
			delay,
			duration,
			easing,
			css: t => `
				transform: ${transform} translate(${(1 - t) * x}px, ${(1 - t) * y}px);
				opacity: ${t * opacity};
				position: ${position};`
		};
	}
*/

	var docWidth = document.documentElement.offsetWidth;

	[].forEach.call(
			document.querySelectorAll('*'),
			function(el) {
				if (el.offsetWidth > docWidth) {
					console.log(el);
				}
			}
	);

</script>

<main>
	<div>
		<hr class="beautiful-line">
		<img class="one" src="imgs/book-whiskey.jpg" width="1240" height="696">
		<hr class="beautiful-line">
	</div>

	<div class="center">
		<h1>Bokklubben</h1>
		<div class="option-container">
			<button class="option-btn" on:click={() => handleDisplay(options.LOGIN)}>Login</button>
			<button class="option-btn" on:click={() => handleDisplay(options.APPLY)}>Søknad</button>
		</div>
		<div class="form-container">
			{#if displayForm === options.LOGIN}
				<fieldset id="l" class="login-container"
									in:fly="{{ delay: 200, x: -200, duration: 800 }}"
									out:fly={{ x: -200, duration: 800 }}>
					<input type="text" id="email" name="email" placeholder="E-Mail" bind:value={email}>
					<input type="password" id="passw" name="passw" placeholder="Password" bind:value={passw}>
					<button  class="login-button">Login</button>
				</fieldset>
 "cells": [
			{:else if displayForm === options.APPLY}
				<fieldset id="a" class="apply-container"
									in:fly="{{ delay: 200,  x: 200, duration: 800 }}"
									out:fly={{ x: 200, duration: 800 }}>
					<input type="text" id="name" name="name" placeholder="Navn" bind:value={username}>
					<input type="text" id="tlf" name="tlf" placeholder="Telefon" bind:value={tlf}>
					<input type="text" id="email-new" name="email-new" placeholder="E-Mail" bind:value={email}>
					<textarea rows="8" cols="1" placeholder="Søknadstekst"></textarea>
					<button class="login-button">Send Søknad</button>
				</fieldset>
			{/if}
		</div>
	</div>

</main>

<style>
	.form-container {
		overflow: hidden;
		display: grid;
		align-content: start;
		align-items: start;
		justify-items: center;
		height: 500px;
		width: 74%;
		padding: 5px;
		margin: 8px auto;
		position: relative;
	}

	main {
		overflow: scroll;
		text-align: center;
		padding: 1em;
		max-width: none;
		margin: 0 auto;
	}

	h2 {
		color: #1a1717;
		text-transform: uppercase;
		font-size: 4em;
		font-weight: 100;
	}

	h1 {
		color: black; /*#ff3e00*/
		text-transform: uppercase;
		font-size: 4em;
		font-weight: 100;
	}
/*
	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
*/
	img.one {
		height: auto;
		width: 80%;
		padding: 2px;
		margin:  10px auto;
	}

	.option-container {
		background: #262222;
		width: 74%;
		padding: 5px;
		margin: 8px auto;
		border-radius: 4px;
	}

	.option-btn {
		display: inline;
		background: transparent;
		color: whitesmoke;
		text-align: center;
		border: none;
		margin: 2px 2px;
		padding: 0.4em 1em;
	}

	.option-btn:hover {
		background: #666666;
	}
	.login-button {
		display: block;
		background: black;
		color: whitesmoke;
		text-align: center;
		border: none;
		margin-top: 1.6em;
		margin-bottom: 1.6em;
		padding: 0.4em 1em;
	}

	.login-button:hover {
		background: #666666;
	}

	hr.beautiful-line{
		border-top: 2px solid #262222;
		border-radius: 6px;
		width: 80%;
	}

	.center {
		justify-content: center;
		margin: auto;
	}

	.apply-container,
	.login-container {
		position: absolute;
		display: flex;
		flex-direction: column;
		align-items: center;
		margin: auto auto;
		border: 2px solid darkgrey;
		border-radius: 6px;
		padding-top: 0.5em;
		padding-bottom: 0.2em;
		padding-left: 0.2em;
		padding-right: 0.2em;
		grid-column: 1 / 2;
		grid-row: 1 / 2;
	}

	.apply-container {
		width: 74%;
	}

	.login-container {
		width: 34%;
	}

	.apply-container input,
	.login-container input {
		width: 80%;
		margin: 0.5em auto;
		border: none;
		border-bottom: 1px solid darkgrey;
		border-radius: 0;
	}

	.apply-container textarea {
		width: 80%;
		margin: 2em 1em auto;
		border: none;
		border-bottom: 1px solid darkgrey;
		border-radius: 0;
	}

	#login-form {
		width: 22%;
		margin: auto auto;
		border: 2px solid darkgrey;
		border-radius: 6px;
		padding: 0.2em 0.2em;
	}

	#login-form input {
		width: 80%;
		margin: 0.5em auto;
		border: none;
		border-bottom: 1px solid darkgrey;
		border-radius: 0;
	}


	/*
        @media only screen and (min-width: 480px) {
            img.one {
                height: auto;
                width: 80%;
            }
        }
     */
</style>

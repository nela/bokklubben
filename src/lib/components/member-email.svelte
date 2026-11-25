<script lang="ts" module>
	const SITE_URL = 'https://bokklubben.eu';

	// Every style is inline: several email clients (Gmail in some apps, Outlook) drop <style>
	// blocks, and an image without its own size then shows at full size.
	const font = 'Helvetica, Arial, sans-serif';
	const style = {
		page: 'background-color:#ffffff;',
		card: 'max-width:560px;width:100%;',
		header: 'padding:32px 24px 8px;',
		brand: 'color:#18181b;text-decoration:none;',
		logo: 'display:inline-block;width:32px;height:32px;border:0;vertical-align:middle;',
		name: `display:inline-block;margin-left:10px;vertical-align:middle;font-family:'Unbounded',${font};font-size:20px;font-weight:600;color:#18181b;`,
		body: `padding:16px 24px 8px;font-family:${font};font-size:16px;line-height:1.6;color:#18181b;`,
		paragraph: 'margin:0 0 16px;',
		button: `display:inline-block;margin:8px 0 24px;padding:12px 22px;border-radius:6px;background-color:#18181b;color:#ffffff;font-family:${font};font-size:15px;font-weight:600;text-decoration:none;`,
		footer: `padding:16px 24px 32px;border-top:1px solid #e4e4e7;font-family:${font};font-size:13px;line-height:1.5;color:#71717a;`,
		footerLink: 'color:#71717a;'
	};
</script>

<script lang="ts">
	/**
	 * The frame around an email to a member: logo and name, the text (already filled in), a button
	 * and a short footer. Rendered on the server; see $lib/server/services/member-email and
	 * password-reset.
	 *
	 * The logo is a PNG from the site (Gmail and Outlook don't show SVG). The name uses the site's
	 * font where the client loads web fonts (Apple Mail), otherwise a bold sans-serif.
	 */
	let {
		paragraphs,
		button = { label: 'Gå til Bokklubben', url: SITE_URL }
	}: {
		/** Each paragraph as its lines. Rendered as text, so it can't add HTML. */
		paragraphs: Array<Array<string>>;
		/** The button under the text; to the site unless given. */
		button?: { label: string; url: string };
	} = $props();
</script>

<svelte:head>
	<!-- Ask clients not to recolour the email in dark mode; it's designed light. -->
	<meta name="color-scheme" content="light only" />
	<meta name="supported-color-schemes" content="light" />
	<link
		href="https://fonts.googleapis.com/css2?family=Unbounded:wght@600&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style={style.page}>
	<tbody>
		<tr>
			<td align="center">
				<table role="presentation" width="560" cellpadding="0" cellspacing="0" style={style.card}>
					<tbody>
						<tr>
							<td style={style.header}>
								<a href={SITE_URL} style={style.brand}>
									<img
										src={`${SITE_URL}/web-app-manifest-192x192.png`}
										width="32"
										height="32"
										alt=""
										style={style.logo}
									/><span style={style.name}>Bokklubben</span>
								</a>
							</td>
						</tr>
						<tr>
							<td style={style.body}>
								{#each paragraphs as lines, i (i)}
									<p style={style.paragraph}>
										{#each lines as line, j (j)}
											{line}{#if j < lines.length - 1}<br />{/if}
										{/each}
									</p>
								{/each}
								<a href={button.url} style={style.button}>{button.label}</a>
							</td>
						</tr>
						<tr>
							<td style={style.footer}>
								Sendt fra Bokklubben, <a href={SITE_URL} style={style.footerLink}>bokklubben.eu</a>.
							</td>
						</tr>
					</tbody>
				</table>
			</td>
		</tr>
	</tbody>
</table>

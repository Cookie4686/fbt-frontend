<script lang="ts">
	import Button from "#lib/components/ui/button/button.svelte";
	import Route from "#lib/route.js";
</script>

<main>
	<h1>2FA Setup</h1>
	<section class="mx-auto flex w-fit flex-col justify-center gap-2 text-center">
		<Button href={Route.P_2FA_TOTP_SETUP}>Setup TOTP</Button>
	</section>
</main>

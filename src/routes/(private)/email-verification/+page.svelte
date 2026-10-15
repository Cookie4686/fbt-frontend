<script lang="ts">
	import { enhance } from "$app/forms";

	import * as InputOTP from "#lib/components/ui/input-otp/index.js";

	import type { PageServerData } from "./$types";

	const { data }: { data: PageServerData } = $props();
</script>

<main class="flex flex-col items-center space-y-8">
	<h1>Email Verification</h1>
	<p>We have sent verification code to {data.email}</p>
	<form class="mx-auto" method="post" use:enhance action="?/verify">
		<InputOTP.Root name="otp" maxlength={6}>
			{#snippet children({ cells })}
				<InputOTP.Group>
					{#each cells.slice(0, 6) as cell (cell)}
						<InputOTP.Slot {cell} />
					{/each}
				</InputOTP.Group>
			{/snippet}
		</InputOTP.Root>
	</form>
</main>

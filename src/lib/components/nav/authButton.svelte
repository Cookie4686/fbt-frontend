<script lang="ts">
	import { enhance } from "$app/forms";
	import { resolve } from "$app/paths";

	import type { Session } from "#lib/schema/auth.js";

	import { Button } from "#lib/components/ui/button/index.js";

	const { session }: { session?: Session | null } = $props();
</script>

{#if session}
	<form method="post" action="/logout" use:enhance>
		<Button type="submit" variant="outline">Sign out</Button>
	</form>
{:else}
	<Button href={resolve("login")} type="submit" variant="outline">Log In</Button>
{/if}

<script lang="ts">
	import type { LayoutServerData } from "../$types";

	let { data }: { data: LayoutServerData } = $props();
</script>

<h1>Hi, {data.user.username}!</h1>
<p>Your user ID is {data.user.id}.</p>

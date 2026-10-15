<script lang="ts">
	import type { PageServerData } from "./$types";

	let { data }: { data: PageServerData } = $props();

	console.log(data);
</script>

<!-- TODO: keyboard support -->
<div class="flex flex-col items-center">
	<h1>Chart of Accounts</h1>
	<div></div>
</div>

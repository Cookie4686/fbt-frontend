<script lang="ts">
	import { ModeWatcher } from "mode-watcher";

	import favicon from "#lib/assets/favicon.svg";

	import "./layout.css";
	import Nav from "#lib/components/nav/nav.svelte";

	let { children, data } = $props();
	let { session } = $derived(data);
</script>

<svelte:head>
	<title>fbt</title>
	<link rel="icon" href={favicon} />
</svelte:head>

<ModeWatcher />
<div>
	<Nav {session} />
	{@render children()}
</div>

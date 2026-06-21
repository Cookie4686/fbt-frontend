<script lang="ts">
	import favicon from "$lib/assets/favicon.svg";
	import Nav from "$lib/components/nav/nav.svelte";

	import "./layout.css";
	import { ModeWatcher } from "mode-watcher";

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

<script lang="ts">
	import LanguageSelector from "#lib/components/header/language-selector.svelte";
	import ThemeSelector from "#lib/components/header/theme-selector.svelte";
	import * as Sidebar from "#lib/components/ui/sidebar/index.js";
</script>

<div>
	<Sidebar.Trigger />
</div>
<div class="flex gap-2">
	<LanguageSelector />
	<ThemeSelector />
</div>

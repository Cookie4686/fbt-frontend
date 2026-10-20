<script lang="ts">
	import WorkspaceCreateForm from "#lib/components/workspace-create-form.svelte";

	import type { PageData } from "./$types";

	let { data }: { data: PageData } = $props();
</script>

<WorkspaceCreateForm form={data.form} />

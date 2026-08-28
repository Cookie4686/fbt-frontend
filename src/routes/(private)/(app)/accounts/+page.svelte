<script lang="ts">
	import type { Account } from "$lib/server/bookkeeping/schema";

	import { enhance } from "$app/forms";
	import Button from "$lib/components/ui/button/button.svelte";
	import { Checkbox } from "$lib/components/ui/checkbox/index.js";
	import * as Dialog from "$lib/components/ui/dialog/index.js";
	import { Input } from "$lib/components/ui/input";
	import Label from "$lib/components/ui/label/label.svelte";
	import * as Table from "$lib/components/ui/table/index.js";

	import type { ActionData, PageServerData } from "./$types";

	let { data, form }: { data: PageServerData; form: ActionData } = $props();

	let dialogAccount = $state<Partial<Account> | null>(null);
	let dialogCreateOpen = $state<boolean>(false);
	let dialogUpdateOpen = $state<boolean>(false);
	let dialogDeleteOpen = $state<boolean>(false);

	const handleCreate = () => {
		dialogCreateOpen = false;
	};
</script>

<!-- TODO: keyboard support -->
<div class="flex flex-col items-center">
	<h1>Chart of Accounts</h1>
	<div class="w-fit min-w-xl">
		<Table.Root>
			<Table.Header>
				<Table.Row>
					<Table.Head>Code</Table.Head>
					<Table.Head colspan={2}>Name</Table.Head>
					<Table.Head class="text-center">
						<Dialog.Root bind:open={dialogCreateOpen}>
							<Dialog.Trigger>+ New</Dialog.Trigger>
							<Dialog.Content>
								<Dialog.Header>
									<Dialog.Title>Create New Accounts</Dialog.Title>
								</Dialog.Header>
								<form
									class="flex flex-col gap-2"
									id="dialog-create-form"
									action="?/create"
									method="post"
									use:enhance
								>
									<Input type="text" name="name" placeholder="Account Name" />
									<div class="flex gap-4">
										<Checkbox id="toggle" name="isDebit" checked />
										<Label for="isDebit">Is Debit Side</Label>
									</div>
								</form>
								<Dialog.Footer>
									<Button type="submit" form="dialog-create-form" onclick={handleCreate}>
										Create
									</Button>
								</Dialog.Footer>
							</Dialog.Content>
						</Dialog.Root>
					</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				<Dialog.Root bind:open={dialogUpdateOpen}>
					{#each data.accounts as account (account.id)}
						<Table.Row
							onclick={() => {
								dialogAccount = account;
								dialogUpdateOpen = true;
							}}
						>
							<Table.Cell>Account Code (WIP)</Table.Cell>
							<Table.Cell colspan={2}>{account.name}</Table.Cell>
							<Table.Cell>{account.isDebit ? "Debit" : "Credit"}</Table.Cell>
						</Table.Row>
					{/each}
					<Dialog.Content>
						<Dialog.Header>
							<Dialog.Title>Edit Account</Dialog.Title>
						</Dialog.Header>

						<form id="dialog-update-form" action="?/update" method="post" use:enhance>
							<Input type="hidden" name="id" value={dialogAccount?.id} readonly />
							<Input
								type="text"
								name="name"
								placeholder="Account Name"
								defaultValue={dialogAccount?.name}
								aria-invalid={Boolean(form?.properties?.name)}
							/>
							<div class="flex gap-4">
								<Checkbox id="toggle" name="isDebit" checked={dialogAccount?.isDebit} />
								<Label for="isDebit">Is Debit Side</Label>
							</div>
						</form>
						<Dialog.Footer>
							<div class="flex gap-4">
								<Dialog.Root bind:open={dialogDeleteOpen}>
									<Dialog.Trigger>Delete</Dialog.Trigger>
									<Dialog.Content>
										<Dialog.Header>
											<Dialog.Title>Delete Account</Dialog.Title>
											<Dialog.Description>
												This action cannot be undone. Are you sure to continue?
											</Dialog.Description>
										</Dialog.Header>
										<form
											class="hidden"
											id="dialog-delete-form"
											action="?/delete"
											method="post"
											use:enhance
										>
											<Input type="hidden" name="id" value={dialogAccount?.id} readonly />
										</form>
										<Dialog.Footer>
											<Button
												type="submit"
												form="dialog-delete-form"
												onclick={() => (dialogDeleteOpen = dialogUpdateOpen = false)}
											>
												Delete
											</Button>
										</Dialog.Footer>
									</Dialog.Content>
								</Dialog.Root>
								<Button
									type="submit"
									form="dialog-update-form"
									onclick={() => (dialogDeleteOpen = dialogUpdateOpen = false)}
								>
									Edit
								</Button>
							</div>
						</Dialog.Footer>
					</Dialog.Content>
				</Dialog.Root>
			</Table.Body>
		</Table.Root>
	</div>
</div>

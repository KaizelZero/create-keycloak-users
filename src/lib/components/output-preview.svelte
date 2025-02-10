<script lang="ts">
  import { MarkdownDisplay, ViewDropdown, ViewTooltip } from '$lib/components';
  import { Button } from '$lib/components/ui/button';
  import { getUsersState } from '$lib/users-state.svelte';
  import { Download } from 'lucide-svelte';

  let view = 'JSON';
  export let jsonOutput = '';
  export let bitwarden = '';
  export let bitwardenCommands = '';
  export let downloadJson: () => void;
  export let copyToClipboard: (content: string) => void;

  let usersState = getUsersState();

  $: language = view === 'JSON' ? 'json' : view === 'Bitwarden' ? 'plaintext' : 'bash';
  $: currentContent =
    view === 'JSON' ? jsonOutput : view === 'Bitwarden' ? bitwarden : bitwardenCommands;
</script>

<div class="flex max-h-screen flex-col rounded-lg p-4">
  <div class="mb-4 flex items-center justify-between">
    <h3 class="items- flex gap-2 font-semibold">{view} Preview <ViewTooltip {view} /></h3>
    <div class="flex items-center gap-2">
      <ViewDropdown bind:view />
      <Button
        size="sm"
        onclick={downloadJson}
        disabled={usersState.users.length === 0}
        class={'hidden lg:block'}
      >
        Download JSON
      </Button>
      <Button
        size="sm"
        onclick={downloadJson}
        disabled={usersState.users.length === 0}
        class={'block lg:hidden'}
      >
        <Download />
      </Button>
    </div>
  </div>

  <div>
    {#if usersState.users.length > 0}
      <MarkdownDisplay
        content={currentContent}
        {language}
        onCopy={() => copyToClipboard(currentContent)}
      />
    {:else}
      <div class="flex flex-1 items-center justify-center text-gray-500">No users added yet.</div>
    {/if}
  </div>
</div>

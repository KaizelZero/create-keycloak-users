<script lang="ts">
  import { ThemeToggle } from '$lib/components';
  import { Button } from '$lib/components/ui/button';
  import { Square, SquareCheckBig } from 'lucide-svelte';

  export let isGeneratedPassword = true;
  export let toggleGeneratedPassword: () => void;
  export let importJson: () => void;
  export let resetState: () => void;
</script>

<div class="fixed bottom-1 right-1 mr-2 flex gap-x-2 py-2 align-middle">
  <!-- <ThemeToggle /> -->
  <Button variant="outline" onclick={importJson}>Import JSON</Button>
  <Button variant="destructive" onclick={resetState}>Reset</Button>
  <Button onclick={toggleGeneratedPassword}>
    {#if isGeneratedPassword}
      <SquareCheckBig class="size-4" />
    {:else}
      <Square class="size-4" />
    {/if}
    <span class="ml-2">Generated Passwords</span>
  </Button>
</div>

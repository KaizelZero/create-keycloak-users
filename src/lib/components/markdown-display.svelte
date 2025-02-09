<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import { Check, Copy } from 'lucide-svelte';
  import Highlight from 'svelte-highlight';
  import { json, plaintext, shell, type LanguageType } from 'svelte-highlight/languages';
  import { tokyoNightDark } from 'svelte-highlight/styles';

  export let content: string;
  export let language: string;
  export let onCopy: () => void;

  let highlightLanguage: LanguageType<string>;

  if (language === 'json') {
    highlightLanguage = json;
  } else if (language === 'plaintext') {
    highlightLanguage = plaintext;
  } else if (language === 'shell') {
    highlightLanguage = shell;
  }

  let copied = false;

  const handleCopy = () => {
    onCopy();
    copied = true;
    setTimeout(() => {
      copied = false;
    }, 2000);
  };
</script>

<svelte:head>
  {@html tokyoNightDark}
</svelte:head>

<div class="relative rounded-lg bg-[#1a1b26]">
  <div class="flex items-center justify-between rounded-t-lg bg-[#1a1b26] px-4 py-2">
    <span class="text-sm text-muted-foreground">{language}</span>
    <Button variant="ghost" size="sm" class="h-8 px-2" on:click={handleCopy}>
      {#if copied}
        <Check class="h-4 w-4" />
      {:else}
        <Copy class="h-4 w-4" />
      {/if}
      <span class="ml-2">{copied ? 'Copied!' : 'Copy'}</span>
    </Button>
  </div>
  <div
    class="h-[calc(100vh-10rem)] overflow-auto rounded-b-lg border-t border-[#343746] bg-[#1a1b26] p-4"
  >
    <Highlight language={highlightLanguage} code={content} class="overflow-auto text-sm" />
  </div>
</div>

<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import { Check, Copy } from 'lucide-svelte';
  import Highlight, { LineNumbers } from 'svelte-highlight';
  import { bash, json, plaintext, type LanguageType } from 'svelte-highlight/languages';
  import { tokyoNightDark } from 'svelte-highlight/styles';

  export let content: string;
  export let language: string;
  export let onCopy: () => void;

  let highlightLanguage: LanguageType<string>;

  if (language === 'json') {
    highlightLanguage = json;
  } else if (language === 'plaintext') {
    highlightLanguage = plaintext;
  } else if (language === 'bash') {
    highlightLanguage = bash;
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

<div class="relative rounded-lg bg-muted">
  <div class="flex items-center justify-between rounded-t-lg bg-muted px-4 py-2">
    <span class="text-sm text-muted-foreground">{language}</span>
    <Button variant="ghost" size="sm" class="h-8 px-2" onclick={handleCopy}>
      {#if copied}
        <Check class="h-4 w-4" />
      {:else}
        <Copy class="h-4 w-4" />
      {/if}
      <span class="ml-2">{copied ? 'Copied!' : 'Copy'}</span>
    </Button>
  </div>
  <div
    class="flex h-[calc(100vh-10rem)] flex-col rounded-b-lg border border-t border-[#343746] bg-[#1a1b26]"
  >
    <Highlight
      language={highlightLanguage}
      code={content}
      class="flex-1 overflow-auto rounded-lg bg-[#1a1b26] text-sm"
    />
  </div>
</div>

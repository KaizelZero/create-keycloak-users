<script lang="ts">
  import { Button, buttonVariants } from '$lib/components/ui/button';
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
  import * as Select from '$lib/components/ui/select/index.js';
  import { ChevronDown } from 'lucide-svelte';
  export let view: string;

  const views = ['JSON', 'Bitwarden', 'Bitwarden Commands'];
</script>

<Select.Root type="single" name="view" bind:value={view}>
  <Select.Trigger class="w-48">
    {view}
  </Select.Trigger>
  <Select.Content>
    {#each views as view}
      <Select.Item value={view} label={view}>{view}</Select.Item>
    {/each}
  </Select.Content>
</Select.Root>

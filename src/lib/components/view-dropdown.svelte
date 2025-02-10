<script lang="ts">
  import { Button, buttonVariants } from '$lib/components/ui/button';
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
  import { ChevronDown } from 'lucide-svelte';
  export let view: string;
</script>

<DropdownMenu.Root>
  <DropdownMenu.Trigger class={buttonVariants({ variant: 'outline', size: 'sm' })}>
    <span class="flex items-center gap-x-2">
      {view}
      <ChevronDown class="size-4" />
    </span>
  </DropdownMenu.Trigger>
  <DropdownMenu.Content class="w-56">
    <DropdownMenu.RadioGroup bind:value={view}>
      <DropdownMenu.RadioItem value="JSON">JSON</DropdownMenu.RadioItem>
      <DropdownMenu.RadioItem value="Bitwarden">Bitwarden</DropdownMenu.RadioItem>
      <DropdownMenu.RadioItem value="Bitwarden Commands">Bitwarden Commands</DropdownMenu.RadioItem>
    </DropdownMenu.RadioGroup>
  </DropdownMenu.Content>
</DropdownMenu.Root>

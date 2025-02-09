<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
  import { ChevronDown } from 'lucide-svelte';
  export let view: string;
</script>

<DropdownMenu.Root>
  <DropdownMenu.Trigger asChild let:builder>
    <Button variant="outline" builders={[builder]}
      ><span class="flex items-center gap-x-2">{view} <ChevronDown class="size-4" /></span></Button
    >
  </DropdownMenu.Trigger>
  <DropdownMenu.Content class="w-56">
    <DropdownMenu.RadioGroup bind:value={view}>
      <DropdownMenu.RadioItem value="JSON">JSON</DropdownMenu.RadioItem>
      <DropdownMenu.RadioItem value="Bitwarden">Bitwarden</DropdownMenu.RadioItem>
      <DropdownMenu.RadioItem value="Bitwarden Commands">Bitwarden Commands</DropdownMenu.RadioItem>
    </DropdownMenu.RadioGroup>
  </DropdownMenu.Content>
</DropdownMenu.Root>

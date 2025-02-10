<script lang="ts">
  import * as Select from '$lib/components/ui/select/index.js';
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

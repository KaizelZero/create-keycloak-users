<script lang="ts">
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';
  import type { Organization } from '$lib/types';

  export let organization: Organization;
</script>

<div class="flex w-full flex-col gap-4 lg:flex-row">
  <div class="w-full">
    <Label for="org_name">Organization Name</Label>
    <Input
      id="org_name"
      type="text"
      bind:value={organization.name}
      placeholder="Organization Name"
      autocomplete="off"
      autocorrect="off"
      spellcheck="false"
    />
  </div>
  <div class="w-full">
    <Label for="org_url">Organization URL</Label>
    <Input
      id="org_url"
      type="url"
      bind:value={organization.url}
      placeholder="Organization URL"
      autocomplete="off"
      autocorrect="off"
      spellcheck="false"
    />
  </div>
</div>

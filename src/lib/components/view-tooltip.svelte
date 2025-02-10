<script lang="ts">
  import * as Tooltip from '$lib/components/ui/tooltip/index.js';
  import { CircleHelp } from 'lucide-svelte';

  const { view = 'JSON' } = $props();
  let content = $state<string>('');

  $effect(() => {
    switch (view) {
      case 'JSON':
        content = 'Download the JSON file and import it into Keycloak.';
        break;
      case 'Bitwarden':
        content =
          'This format is used for creating Bitwarden Sends.\n- The first line specifies the recipient.\n- The title follows the format: "Organization - Username". \n- The rest is the message body.';
        break;
      case 'Bitwarden Commands':
        content =
          'These are Bitwarden CLI commands for creating users and assigning them to groups. Use this only if you have the Bitwarden CLI installed.';
        break;
    }
  });

  // Replace newlines with <br /> for HTML rendering
  const formattedContent = () => content.replace(/\n/g, '<br />');
</script>

<Tooltip.Provider>
  <Tooltip.Root>
    <Tooltip.Trigger>
      <CircleHelp class="size-4" />
    </Tooltip.Trigger>
    <Tooltip.Content class="w-72">
      {@html formattedContent()}
    </Tooltip.Content>
  </Tooltip.Root>
</Tooltip.Provider>

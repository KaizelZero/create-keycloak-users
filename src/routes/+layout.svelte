<script lang="ts">
  import { Toaster } from '$lib/components/ui/sonner';
  import { setUsersState } from '$lib/users-state.svelte';
  import { ModeWatcher } from 'mode-watcher';
  import '../app.css';

  let { children } = $props();
  setUsersState();
</script>

<ModeWatcher />
{@render children()}
<Toaster position="top-center" richColors closeButton />

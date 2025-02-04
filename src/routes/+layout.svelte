<script lang="ts">
  import { Toaster } from '$lib/components/ui/sonner';
  import { ModeWatcher } from 'mode-watcher';
  import '../app.css';

  let { children } = $props();
</script>

<ModeWatcher />
{@render children()}
<Toaster position="top-center" richColors closeButton />

<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import { type User } from '$lib/types';
  import { getUsersState } from '$lib/users-state.svelte';

  let usersState = getUsersState();

  export let editUser: (user: User) => void;
  export let deleteUser: (username: string) => void;
</script>

{#if usersState.users.length > 0}
  <div class="mt-6 h-96 overflow-auto rounded bg-muted p-4">
    <h3 class="mb-2 font-semibold">Users Added ({usersState.users.length}):</h3>
    <ul class="space-y-2">
      {#each usersState.users as user, index (user.username)}
        <li
          class="flex items-center justify-between rounded bg-muted-foreground p-2 text-foreground shadow-sm"
        >
          <div>
            <span class="font-medium text-muted">{user.username}</span>
            <span class="ml-2 text-sm text-muted">({user.role})</span>
          </div>
          <div class="flex gap-2">
            <Button size="sm" variant="outline" on:click={() => editUser(user)}>Edit</Button>
            <Button size="sm" variant="destructive" on:click={() => deleteUser(user.username)}>
              Delete
            </Button>
          </div>
        </li>
      {/each}
    </ul>
  </div>
{/if}

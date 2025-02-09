<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import { type User } from '$lib/types';
  import { getUsersState } from '$lib/users-state.svelte';
  import { Pencil, Trash } from 'lucide-svelte';

  let usersState = getUsersState();

  export let editUser: (user: User) => void;
  export let deleteUser: (username: string) => void;
</script>

{#if usersState.users.length > 0}
  <div class="rounded-lg border border-[#343746] bg-muted shadow-sm">
    <div class="sticky top-0 z-10 border-b border-[#343746] bg-muted/95 backdrop-blur-sm">
      <h3 class="px-4 py-3 text-lg font-semibold text-foreground">
        User Accounts · <span class="text-muted-foreground">{usersState.users.length} added</span>
      </h3>
    </div>

    <div class="h-[19rem] overflow-y-auto">
      <ul class="space-y-2 p-4">
        {#each usersState.users as user, index (user.username)}
          <li
            class="group flex items-center justify-between rounded-lg bg-background p-3 transition-all
                   hover:bg-accent/50 hover:shadow-sm"
          >
            <div class="flex-1 truncate pr-4">
              <div class="flex items-baseline gap-2">
                <span class="truncate font-medium text-foreground">{user.username}</span>
                <span class="text-sm text-muted-foreground">({user.role})</span>
              </div>
              {#if user.email}
                <div class="truncate text-sm text-muted-foreground">{user.email}</div>
              {/if}
            </div>

            <div class="flex shrink-0 gap-2 opacity-0 transition-opacity group-hover:opacity-100">
              <Button
                size="icon"
                variant="ghost"
                class="h-8 w-8 p-0"
                on:click={() => editUser(user)}
                aria-label="Edit user"
              >
                <Pencil class="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                class="h-8 w-8 p-0 text-destructive hover:text-destructive"
                on:click={() => deleteUser(user.username)}
                aria-label="Delete user"
              >
                <Trash class="h-4 w-4" />
              </Button>
            </div>
          </li>
        {/each}
      </ul>
    </div>
  </div>
{/if}

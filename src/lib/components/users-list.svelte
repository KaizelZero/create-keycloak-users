<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { type User } from '$lib/types';
  import { getUsersState } from '$lib/users-state.svelte';
  import { Pencil, Trash, X } from 'lucide-svelte';

  let usersState = getUsersState();

  let filter = $state('');

  let { editUser, deleteUser } = $props<{
    editUser: (user: User) => void;
    deleteUser: (username: string) => void;
  }>();

  let filteredUsers = $state<User[]>([]);

  function clearFilter() {
    filter = '';
  }

  $effect(() => {
    const filterValue = filter.toLowerCase(); // Make filter case-insensitive

    // Filter users based on the filter value
    filteredUsers = usersState.users.filter(
      (user) =>
        user.username.toLowerCase().includes(filterValue) ||
        user.firstName.toLowerCase().includes(filterValue) ||
        user.lastName.toLowerCase().includes(filterValue) ||
        (user.email && user.email.toLowerCase().includes(filterValue)) ||
        user.role.toLowerCase().includes(filterValue)
    );
  });
</script>

{#if usersState.users.length > 0}
  <div class="rounded-lg border border-[#343746] bg-muted shadow-sm">
    <div
      class="sticky top-0 z-10 flex items-center justify-between rounded-t-lg border-b border-[#343746] bg-muted/95 backdrop-blur-sm"
    >
      <h3 class="px-4 py-3 text-lg font-semibold text-foreground">
        User Accounts · <span class="text-muted-foreground">{usersState.users.length} added</span>
      </h3>
      <div class="relative mr-4 w-[250px] max-w-sm">
        <Input
          type="search"
          class="w-[250px]"
          placeholder="Filter users..."
          bind:value={filter}
          autocomplete="off"
          autocorrect="off"
          spellcheck="false"
        />
      </div>
    </div>

    <div class="h-[calc(100vh-47rem)] min-h-[100px] overflow-y-auto">
      <ul class="w-full min-w-full space-y-2 p-4">
        {#each filteredUsers as user, index (user.username)}
          <!-- svelte-ignore a11y_click_events_have_key_events -->
          <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
          <li
            class="group flex items-center justify-between rounded-lg bg-background p-3 transition-all
          hover:bg-accent/50 hover:shadow-sm"
            onclick={() => editUser(user)}
          >
            <div class="flex-1 truncate pr-4">
              <div class="flex items-baseline gap-2">
                <span class="truncate font-medium">{user.username}</span>
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
                onclick={() => editUser(user)}
                aria-label="Edit user"
              >
                <Pencil class="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                class="z-10 h-8 w-8 p-0 text-destructive hover:text-destructive"
                onclick={(e) => {
                  e.stopPropagation();
                  deleteUser(user.username);
                }}
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

<script lang="ts">
  let users: Array<{ username: string; password: string }> = [];
  let organization: { name: string; url: string } = { name: '', url: '' };
  let currentUser = { username: '', password: '' };
  let jsonOutput = '';
  let error = '';
  let editingIndex: number | null = null;

  function addUser() {
    if (currentUser.username && currentUser.password) {
      users = [...users, { ...currentUser }];
      resetForm();
    } else {
      error = 'Please fill in both fields';
    }
  }

  function editUser(index: number) {
    editingIndex = index;
    currentUser = { ...users[index] };
  }

  function updateUser() {
    if (editingIndex !== null && currentUser.username && currentUser.password) {
      users[editingIndex] = { ...currentUser };
      resetForm();
    } else {
      error = 'Please fill in both fields';
    }
  }

  function deleteUser(index: number) {
    users = users.filter((_, i) => i !== index);
    resetForm();
  }

  function resetForm() {
    currentUser = { username: '', password: '' };
    editingIndex = null;
    error = '';
    updateJsonPreview();
  }

  function updateJsonPreview() {
    jsonOutput = JSON.stringify(
      {
        users: users.map((user) => ({
          username: user.username,
          credentials: [
            {
              type: 'password',
              value: user.password,
              temporary: true
            }
          ],
          enabled: true
        }))
      },
      null,
      2
    );
  }

  function copyToClipboard() {
    navigator.clipboard.writeText(jsonOutput);
  }
</script>

<div class="grid grid-cols-2 gap-8">
  <!-- Input Column -->
  <div class="flex flex-col gap-4">
    <!-- Organization -->
    <div class="mb-4">
      <label for="organization" class="block font-semibold">Organization</label>
      <input
        type="text"
        id="organization"
        bind:value={organization.name}
        class="w-full rounded border p-2"
      />
      <input
        type="text"
        id="organization-url"
        bind:value={organization.url}
        class="w-full rounded border p-2"
      />
    </div>
    <form
      on:submit|preventDefault={editingIndex === null ? addUser : updateUser}
      class="flex flex-col gap-4"
    >
      <div class="mb-4">
        <label for="username" class="block font-semibold">Username</label>
        <input
          type="text"
          id="username"
          bind:value={currentUser.username}
          class="w-full rounded border p-2"
        />
      </div>

      <div class="mb-4">
        <label for="password" class="block font-semibold">Password</label>
        <input
          type="password"
          id="password"
          bind:value={currentUser.password}
          class="w-full rounded border p-2"
        />
      </div>

      <div class="flex gap-2">
        <button type="submit" class="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600">
          {editingIndex === null ? 'Add User +' : 'Update User'}
        </button>

        <button
          type="button"
          on:click={resetForm}
          class="rounded bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
          disabled={editingIndex === null && users.length === 0}
        >
          Cancel
        </button>
      </div>
    </form>

    {#if error}
      <div class="mt-2 text-red-500">{error}</div>
    {/if}

    {#if users.length > 0}
      <div class="mt-6 rounded bg-gray-50 p-4">
        <h3 class="font-semibold">Users Added ({users.length}):</h3>
        <ul class="list-disc pl-4">
          {#each users as user, index (user.username)}
            <li class="flex items-center justify-between">
              <span>{user.username}</span>
              <div class="flex gap-2">
                <button
                  on:click={() => editUser(index)}
                  class="rounded bg-yellow-500 px-2 py-1 text-sm text-white hover:bg-yellow-600"
                >
                  Edit
                </button>
                <button
                  on:click={() => deleteUser(index)}
                  class="rounded bg-red-500 px-2 py-1 text-sm text-white hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </li>
          {/each}
        </ul>
      </div>
    {/if}
  </div>

  <!-- JSON Preview Column -->
  <div class="flex flex-col rounded bg-gray-100 p-4">
    <div class="mb-4 flex items-center justify-between">
      <h3 class="font-semibold">JSON Preview</h3>
      <button
        on:click={copyToClipboard}
        class="rounded bg-gray-500 px-3 py-1 text-sm text-white hover:bg-gray-600"
      >
        Copy JSON
      </button>
    </div>

    {#if users.length > 0}
      <pre
        class="max-h-96 overflow-auto whitespace-pre-wrap break-words rounded bg-white p-4">{jsonOutput}</pre>
    {:else}
      <p class="italic text-gray-500">
        No users added yet. Start adding users to see the JSON preview.
      </p>
    {/if}
  </div>
</div>

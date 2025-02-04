<script lang="ts">
  import { ThemeToggle } from '$lib/components';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';
  import * as RadioGroup from '$lib/components/ui/radio-group';
  import { open, save } from '@tauri-apps/api/dialog';
  import { readTextFile, writeTextFile } from '@tauri-apps/api/fs';
  import ClipboardCheck from 'lucide-svelte/icons/clipboard-check';
  import ClipboardCopy from 'lucide-svelte/icons/clipboard-copy';
  import Download from 'lucide-svelte/icons/download';
  import { toast } from 'svelte-sonner';

  type User = {
    username: string;
    password: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };

  type Organization = {
    name: string;
    url: string;
  };

  const ROLES = ['Administrator', 'Data Administrator', 'Data Editor', 'Data Viewer'] as const;

  let organization: Organization = { name: '', url: '' };
  $: users = [] as User[];
  let currentUser: User = createEmptyUser();
  let jsonOutput = '';
  let error = '';
  let editingIndex: number | null = null;
  let showPassword = false;
  $: isGeneratedPassword = true;
  let usernameInput: HTMLInputElement | null = null;

  function createEmptyUser(): User {
    return {
      username: '',
      password: '',
      email: '',
      firstName: '',
      lastName: '',
      role: ROLES[1]
    };
  }

  function generatePassword(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    return Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join(
      ''
    );
  }

  function toggleGeneratedPassword() {
    isGeneratedPassword = !isGeneratedPassword;
    if (isGeneratedPassword) {
      currentUser.password = generatePassword();
    }
  }

  $: if (isGeneratedPassword) currentUser.password = generatePassword();

  function resetState() {
    users = [];
    currentUser = createEmptyUser();
    if (isGeneratedPassword) currentUser.password = generatePassword();
    error = '';
    updateJsonPreview();
    toast.info('Reset State');
  }

  function handleSubmit() {
    if (!currentUser.username || !currentUser.password || !currentUser.role) {
      error = 'Please fill in all required fields (username, password, role)';
      return;
    }

    const isDuplicate = users.some(
      (user, index) =>
        user.username.toLowerCase() === currentUser.username.toLowerCase() && index !== editingIndex
    );

    if (isDuplicate) {
      error = 'Username already exists. Please choose a different one.';
      focusUsername();
      return;
    }

    if (editingIndex !== null) {
      users[editingIndex] = { ...currentUser };
    } else {
      users = [...users, { ...currentUser }];
    }

    resetForm();
    focusUsername();
  }

  function editUser(index: number) {
    editingIndex = index;
    currentUser = { ...users[index] };
  }

  function deleteUser(index: number) {
    users = users.filter((_, i) => i !== index);
    if (editingIndex === index) resetForm();
  }

  function capitalizeName(event: Event) {
    const input = event.target as HTMLInputElement;
    input.value = input.value.replace(/\b\w/g, (char) => char.toUpperCase());
  }

  function resetForm() {
    editingIndex = null;
    currentUser = createEmptyUser();
    if (isGeneratedPassword) currentUser.password = generatePassword();
    error = '';
    updateJsonPreview();
  }

  function updateJsonPreview() {
    jsonOutput = JSON.stringify(
      {
        users: users.map((user) => ({
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          credentials: [{ type: 'password', value: user.password, temporary: true }],
          realmRoles: [user.role],
          requiredActions: ['UPDATE_PASSWORD'],
          enabled: true
        }))
      },
      null,
      2
    );
  }

  async function downloadJson() {
    try {
      // Prompt the user to select a save location
      const filePath = await save({
        defaultPath: `${organization.name || 'users'}.json`,
        filters: [{ name: 'JSON', extensions: ['json'] }]
      });

      if (filePath) {
        // Write the JSON data to the selected file
        await writeTextFile(filePath, jsonOutput);
        console.log('File saved successfully:', filePath);
      }
    } catch (error) {
      toast.error(`Failed to save file: ${error}`);
      console.error('Failed to save file:', error);
    }
  }

  async function importJson() {
    try {
      const filePath = await open({
        multiple: false,
        directory: false,
        filters: [{ name: 'JSON', extensions: ['json'] }]
      });

      if (filePath) {
        resetState();
        const json = await readTextFile(filePath as string);
        const parsed = JSON.parse(json);

        if (!parsed.users || !Array.isArray(parsed.users)) {
          error = 'Invalid JSON format: Missing users array';
          return;
        }

        users = parsed.users.map((user: any) => {
          const mappedUser: User = {
            username: user.username || '',
            password: user.credentials?.[0]?.value,
            email: user.email || '',
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            role: user.realm_roles[0]
          };
          return mappedUser;
        });

        currentUser = createEmptyUser();
        if (isGeneratedPassword) currentUser.password = generatePassword();
        error = '';
        updateJsonPreview();
      }
    } catch (error) {
      toast.error(`Failed to import file: ${error}`);
      console.error('Failed to import file:', error);
    }
  }

  let copied = false;
  function copyToClipboard() {
    navigator.clipboard.writeText(jsonOutput);
    copied = true;
    toast.success('Copied to clipboard!');
    setTimeout(() => {
      copied = false;
    }, 2000);
  }

  function focusUsername() {
    usernameInput?.focus();
  }

  $: updateJsonPreview();
</script>

<div class="min-h-screen">
  <div class="grid h-[calc(100vh-4rem)] grid-cols-2 gap-8 p-2">
    <!-- Input Column -->
    <div class="flex select-none flex-col gap-4">
      <!-- Organization -->
      <div class="flex w-full flex-col gap-4 lg:flex-row">
        <div class="w-full">
          <Label for="org_name">Organization Name</Label>
          <Input id="org_name" bind:value={organization.name} placeholder="Organization Name" />
        </div>
        <div class="w-full">
          <Label for="org_url">Organization URL</Label>
          <Input
            type="url"
            id="org_url"
            bind:value={organization.url}
            placeholder="Organization URL"
          />
        </div>
      </div>

      <form on:submit|preventDefault={handleSubmit} class="flex flex-col gap-4">
        <div>
          <Label for="username">
            Username <span class="text-sm text-gray-500">(required)</span>
          </Label>
          <input
            id="username"
            class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            bind:value={currentUser.username}
            bind:this={usernameInput}
            required
          />
        </div>

        <div>
          <Label for="email">Email</Label>
          <Input type="email" id="email" bind:value={currentUser.email} />
        </div>
        <div class="flex flex-col gap-4 lg:grid lg:grid-cols-2">
          <div>
            <Label for="firstName">First Name</Label>
            <Input id="firstName" bind:value={currentUser.firstName} on:input={capitalizeName} />
          </div>
          <div>
            <Label for="lastName">Last Name</Label>
            <Input id="lastName" bind:value={currentUser.lastName} on:input={capitalizeName} />
          </div>
        </div>

        <!-- Password Section with Toggle -->
        <div>
          <Label for="password">
            Password <span class="text-sm text-gray-500">(required)</span>
          </Label>
          <div class="flex gap-2">
            <Input
              type={showPassword ? 'text' : 'password'}
              id="password"
              bind:value={currentUser.password}
              disabled={isGeneratedPassword}
              required
            />
            <div class="flex items-center gap-2">
              <input
                type="checkbox"
                id="show-password"
                bind:checked={showPassword}
                class="h-4 w-4 rounded border"
              />
              <Label for="show-password" class="text-sm">Show Password</Label>
            </div>
          </div>
        </div>

        <fieldset>
          <legend class="mb-2 text-sm font-medium">
            Role
            <span class="text-gray-500">(required)</span>
          </legend>
          <RadioGroup.Root bind:value={currentUser.role}>
            {#each ROLES as role}
              <div class="flex items-center space-x-2">
                <RadioGroup.Item value={role} id={role} />
                <Label for={role} class="text-sm">{role}</Label>
              </div>
            {/each}
          </RadioGroup.Root>
        </fieldset>

        <div class="flex gap-2">
          <Button type="submit">{editingIndex === null ? 'Add User' : 'Update User'}</Button>
          {#if editingIndex !== null}
            <Button variant="destructive" on:click={resetForm}>Cancel Edit</Button>
          {:else}
            <Button variant="outline" on:click={resetForm}>Reset Form</Button>
          {/if}
        </div>
      </form>

      {#if error}
        <div class="mt-2 text-sm text-red-500">{error}</div>
      {/if}

      {#if users.length > 0}
        <div class="mt-6 rounded bg-muted p-4">
          <h3 class="mb-2 font-semibold">Users Added ({users.length}):</h3>
          <ul class="space-y-2">
            {#each users as user, index (user.username)}
              <li
                class="flex items-center justify-between rounded bg-muted-foreground p-2 text-foreground shadow-sm"
              >
                <div>
                  <span class="font-medium text-muted">{user.username}</span>
                  <span class="ml-2 text-sm text-muted">({user.role})</span>
                </div>
                <div class="flex gap-2">
                  <Button size="sm" variant="outline" on:click={() => editUser(index)}>Edit</Button>
                  <Button size="sm" variant="destructive" on:click={() => deleteUser(index)}>
                    Delete
                  </Button>
                </div>
              </li>
            {/each}
          </ul>
        </div>
      {/if}
    </div>

    <!-- JSON Preview Column -->
    <div class="flex max-h-screen flex-col rounded-lg p-4">
      <div class="mb-4 flex items-center justify-between">
        <h3 class="font-semibold">JSON Preview</h3>
        <div class="flex gap-2">
          <Button
            size="sm"
            on:click={copyToClipboard}
            disabled={users.length === 0}
            class={'hidden lg:block'}
          >
            {copied ? 'Copied!' : 'Copy JSON'}
          </Button>
          <Button
            size="sm"
            on:click={copyToClipboard}
            disabled={users.length === 0}
            class={'block lg:hidden'}
          >
            {#if copied}
              <ClipboardCheck />
            {:else}
              <ClipboardCopy />
            {/if}
          </Button>
          <Button
            size="sm"
            on:click={downloadJson}
            disabled={users.length === 0}
            class={'hidden lg:block'}
          >
            Download JSON
          </Button>
          <Button
            size="sm"
            on:click={downloadJson}
            disabled={users.length === 0}
            class={'block lg:hidden'}
          >
            <Download />
          </Button>
        </div>
      </div>

      {#if users.length > 0}
        <pre class="flex-1 overflow-auto rounded bg-muted p-4 font-mono text-sm">{jsonOutput}</pre>
      {:else}
        <div class="flex flex-1 items-center justify-center text-gray-500">No users added yet.</div>
      {/if}
    </div>
  </div>
</div>

<div class="fixed bottom-1 right-1 flex gap-x-2 py-2 align-middle">
  <ThemeToggle />
  <Button variant="outline" on:click={importJson}>Import JSON</Button>
  <Button variant="destructive" on:click={resetState}>Reset</Button>
  <Button on:click={toggleGeneratedPassword}>
    {isGeneratedPassword ? 'Generated Password' : 'Manual Password'}
  </Button>
</div>

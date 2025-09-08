<script lang="ts">
  import { Footer, OrganizationForm, OutputPreview, UsersList } from '$lib/components';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';
  import * as RadioGroup from '$lib/components/ui/radio-group';
  import { ROLES, type Organization, type User } from '$lib/types';
  import { getUsersState } from '$lib/users-state.svelte';
  import {
    credentialsUtils,
    formatBitwardenCommands,
    formatBitwardenData,
    generateJsonOutput
  } from '$lib/utils';
  import { open, save } from '@tauri-apps/api/dialog';
  import { readTextFile, writeTextFile } from '@tauri-apps/api/fs';
  import { appWindow } from '@tauri-apps/api/window';
  import { toast } from 'svelte-sonner';

  const usersState = getUsersState();

  let isDragging = $state(false);
  let isEditing = $state<boolean>(false);
  let isGeneratedPassword = $state<boolean>(true);

  let organization = $state<Organization>({
    name: '',
    url: ''
  });

  let currentUser = $state<User>(createEmptyUser());
  let oldUser = $state<User>(createEmptyUser());

  let jsonOutput = $state<string>('');
  let bitwarden = $state<string>('');
  let bitwardenCommands = $state<string>('');
  let error = $state<string>('');

  let usernameInput: HTMLInputElement | null = null;

  function createEmptyUser(): User {
    return {
      username: '',
      password: isGeneratedPassword ? credentialsUtils.generatePassword() : '',
      email: '',
      firstName: '',
      lastName: '',
      role: ROLES[1]
    };
  }

  function toggleGeneratedPassword() {
    isGeneratedPassword = !isGeneratedPassword;
  }

  $effect(() => {
    if (isGeneratedPassword && !isEditing && currentUser.password === '')
      currentUser.password = credentialsUtils.generatePassword();
  });

  function resetState(showToast = true) {
    usersState.clearUsers();
    currentUser = createEmptyUser();
    isGeneratedPassword = true;
    isEditing = false;
    organization = { name: '', url: '' };

    error = '';
    if (showToast) {
      toast.success('State reset');
    }
  }

  function handleSubmit() {
    if (!currentUser.username || !currentUser.password || !currentUser.role) {
      error = 'Please fill in all required fields (username, password, role)';
      return;
    }

    const isDuplicate = usersState.checkDuplicate(currentUser.username);

    if (isDuplicate && !isEditing) {
      error = 'Username already exists. Please choose a different one.';
      focusUsername();
      return;
    }

    if (isEditing) {
      usersState.updateUser(oldUser, currentUser);
    } else {
      usersState.addUser(currentUser);
    }

    resetForm();
    focusUsername();
  }

  function editUser(user: User) {
    currentUser = { ...user };
    oldUser = { ...user };
    isEditing = true;
  }

  function deleteUser(username: string) {
    usersState.deleteUser(username);
    resetForm();
  }

  function resetForm() {
    isEditing = false;
    currentUser = createEmptyUser();
    if (isGeneratedPassword) currentUser.password = credentialsUtils.generatePassword();
    error = '';
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
        resetState(false);
        const json = await readTextFile(filePath as string);
        const parsed = JSON.parse(json);
        await handleImportedJson(parsed);
      }
    } catch (error) {
      toast.error(`Failed to import file: ${error}`);
    }
  }

  async function handleImportedJson(parsed: any) {
    if (!parsed.users || !Array.isArray(parsed.users)) {
      error = 'Invalid JSON format: Missing users array';
      return false;
    }

    // Update organization if present in JSON
    if (parsed.organization) {
      organization = parsed.organization;
    }

    // Clear existing users and add new ones
    usersState.clearUsers();
    parsed.users.forEach((user: any) => {
      usersState.addUser({
        username: user.username || '',
        password: user.credentials?.[0]?.value || credentialsUtils.generatePassword(),
        email: user.email || '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        role: user.realmRoles?.[0] || ROLES[1]
      });
    });

    error = '';
    toast.success('Successfully imported users!');
    return true;
  }

  let copied = false;
  function copyToClipboard(output: string) {
    navigator.clipboard.writeText(output);
    copied = true;
    toast.success('Copied to clipboard!');
    setTimeout(() => {
      copied = false;
    }, 2000);
  }

  function focusUsername() {
    usernameInput?.focus();
  }

  $effect(() => {
    if (usersState.users.length > 0) {
      jsonOutput = generateJsonOutput(usersState.users, organization);
      bitwarden = formatBitwardenData(usersState.users, organization);
      bitwardenCommands = formatBitwardenCommands(usersState.users, organization);
    } else {
      jsonOutput = '';
      bitwarden = '';
      bitwardenCommands = '';
    }
  });

  // Tauri-specific file drop handling
  $effect(() => {
    const unlisten = appWindow.onFileDropEvent(async (event) => {
      switch (event.payload.type) {
        case 'hover':
          isDragging = true;
          break;
        case 'drop':
          isDragging = false;
          await handleDroppedFiles(event.payload.paths);
          break;
        case 'cancel':
          isDragging = false;
          break;
      }
    });

    return () => {
      unlisten.then((f) => f());
    };
  });

  async function handleDroppedFiles(paths: string[]) {
    if (paths.length === 0) return;

    const filePath = paths[0];
    if (!filePath.endsWith('.json')) {
      toast.error('Only JSON files are allowed');
      return;
    }

    try {
      resetState(false);
      const contents = await readTextFile(filePath);
      const parsed = JSON.parse(contents);
      await handleImportedJson(parsed);
    } catch (error) {
      toast.error(`Failed to import file: ${error}`);
    }
  }
</script>

<div class="">
  <div class="h-[calc(100vh-4rem)] gap-8 p-2 lg:grid lg:grid-cols-2">
    <!-- Input Column -->
    <div class="flex select-none flex-col gap-4 p-4">
      <!-- Organization -->
      <OrganizationForm bind:organization />

      <form
        onsubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
        class="flex flex-col gap-4"
      >
        <div>
          <Label for="username">
            Username <span class="text-sm text-gray-500">(required)</span>
          </Label>
          <input
            id="username"
            type="text"
            class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            bind:value={currentUser.username}
            bind:this={usernameInput}
            required
            autocomplete="off"
            autocorrect="off"
            spellcheck="false"
          />
        </div>

        <div>
          <Label for="email">Email</Label>
          <Input
            type="email"
            id="email"
            bind:value={currentUser.email}
            autocomplete="off"
            autocorrect="off"
            spellcheck="false"
          />
        </div>
        <div class="flex flex-col gap-4 lg:grid lg:grid-cols-2">
          <div>
            <Label for="firstName">First Name</Label>
            <Input
              id="firstName"
              type="text"
              bind:value={currentUser.firstName}
              oninput={(e) =>
                (currentUser.firstName = credentialsUtils.capitalize(e.currentTarget.value))}
              autocomplete="off"
              autocorrect="off"
              spellcheck="false"
            />
          </div>
          <div>
            <Label for="lastName">Last Name</Label>
            <Input
              id="lastName"
              type="text"
              bind:value={currentUser.lastName}
              oninput={(e) =>
                (currentUser.lastName = credentialsUtils.capitalize(e.currentTarget.value))}
              autocomplete="off"
              autocorrect="off"
              spellcheck="false"
            />
          </div>
        </div>

        <!-- Password Section with Toggle -->
        <div>
          <Label for="password">
            Password <span class="text-sm text-gray-500">(required)</span>
          </Label>
          <div class="flex gap-2">
            <Input
              type="text"
              bind:value={currentUser.password}
              disabled={isGeneratedPassword}
              required
              autocomplete="off"
              autocorrect="off"
              spellcheck="false"
            />
          </div>
        </div>

        <fieldset>
          <legend class="mb-2 text-sm font-medium">
            Role
            <span class="text-gray-500">(required)</span>
          </legend>
          <RadioGroup.Root bind:value={currentUser.role}>
            {#each ROLES as role}
              <Label
                for={role}
                class="group flex items-center gap-2 text-sm hover:cursor-pointer hover:underline hover:underline-offset-2"
              >
                <RadioGroup.Item
                  value={role}
                  id={role}
                  class="group group-hover:underline group-hover:underline-offset-2"
                />
                {role}
              </Label>
            {/each}
          </RadioGroup.Root>
          <!-- Custom Role -->
          <Label for="customRole" class="mt-2 text-sm">Custom Role (optional)</Label>
          <Input
            type="text"
            id="customRole"
            bind:value={currentUser.role}
            placeholder="Enter custom role"
            autocomplete="off"
            autocorrect="off"
            spellcheck="false"
            class="mt-1"
          />
        </fieldset>

        <div class="flex gap-2">
          <Button type="submit">{!isEditing ? 'Add User' : 'Update User'}</Button>
          {#if isEditing}
            <Button variant="destructive" onclick={resetForm}>Cancel Edit</Button>
          {:else}
            <Button variant="outline" onclick={resetForm}>Reset Form</Button>
          {/if}
        </div>
      </form>

      <div class="relative mb-0 mt-4">
        {#if error}
          <div
            class="animate-fade-in absolute inset-x-0 -top-5 text-sm text-red-500 transition-opacity"
          >
            {error}
          </div>
        {/if}
      </div>

      <UsersList {editUser} {deleteUser} />
    </div>

    <!-- JSON Preview Column -->
    <OutputPreview
      bind:jsonOutput
      bind:bitwarden
      bind:bitwardenCommands
      {downloadJson}
      {copyToClipboard}
    />
  </div>
</div>

<Footer {isGeneratedPassword} {toggleGeneratedPassword} {importJson} {resetState} />
{#if isDragging}
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
  >
    <div
      class="rounded-lg border-2 border-dashed border-primary p-8 text-2xl font-bold text-primary"
    >
      Drop JSON File to Import
    </div>
  </div>
{/if}

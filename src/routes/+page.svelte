<script lang="ts">
  import { Footer, OrganizationForm, OutputPreview, UsersList } from '$lib/components';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';
  import * as RadioGroup from '$lib/components/ui/radio-group';
  import { ROLES, type Organization, type User } from '$lib/types';
  import { getUsersState } from '$lib/users-state.svelte';
  import { formatBitwardenCommands, formatBitwardenData } from '$lib/utils';
  import { open, save } from '@tauri-apps/api/dialog';
  import { readTextFile, writeTextFile } from '@tauri-apps/api/fs';
  import { toast } from 'svelte-sonner';

  const usersState = getUsersState();
  let users = usersState.users;

  console.log(usersState);

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

  let isEditing = $state<boolean>(false);
  let showPassword = $state<boolean>(true);
  let isGeneratedPassword = $state<boolean>(true);

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

  $effect(() => {
    if (isGeneratedPassword && !isEditing) currentUser.password = generatePassword();
  });

  function resetState() {
    usersState.clearUsers();
    currentUser = createEmptyUser();
    isGeneratedPassword = true;
    showPassword = true;
    isEditing = false;
    organization = { name: '', url: '' };

    if (isGeneratedPassword) currentUser.password = generatePassword();
    error = '';
    toast.info('Reset State');
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

  function capitalizeName(event: Event) {
    const input = event.target as HTMLInputElement;
    input.value = input.value.replace(/\b\w/g, (char) => char.toUpperCase());
  }

  function resetForm() {
    isEditing = false;
    currentUser = createEmptyUser();
    if (isGeneratedPassword) currentUser.password = generatePassword();
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
            role: user.realmRoles[0]
          };
          return mappedUser;
        });

        currentUser = createEmptyUser();
        if (isGeneratedPassword) currentUser.password = generatePassword();
        error = '';
      }
    } catch (error) {
      toast.error(`Failed to import file: ${error}`);
      console.error('Failed to import file:', error);
    }
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
      jsonOutput = JSON.stringify(
        {
          organization,
          users: usersState.users.map((user) => ({
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

      bitwarden = formatBitwardenData(usersState.users, organization);

      bitwardenCommands = formatBitwardenCommands(usersState.users, organization);
    } else {
      jsonOutput = '';
      bitwarden = '';
      bitwardenCommands = '';
    }
  });
</script>

<div class="min-h-screen">
  <div class="grid h-[calc(100vh-4rem)] grid-cols-2 gap-8 p-2">
    <!-- Input Column -->
    <div class="flex select-none flex-col gap-4">
      <!-- Organization -->
      <OrganizationForm bind:organization />

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
          <Button type="submit">{!isEditing ? 'Add User' : 'Update User'}</Button>
          {#if isEditing}
            <Button variant="destructive" on:click={resetForm}>Cancel Edit</Button>
          {:else}
            <Button variant="outline" on:click={resetForm}>Reset Form</Button>
          {/if}
        </div>
      </form>

      {#if error}
        <div class="mt-2 text-sm text-red-500">{error}</div>
      {/if}

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

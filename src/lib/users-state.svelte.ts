import type { User } from '$lib/types';
import { json } from '@sveltejs/kit';
import { getContext, setContext } from 'svelte';

export class UsersState {
  users = $state<User[]>([]);

  constructor() {}

  addUser(user: User) {
    this.users.push(user);
    console.log(this.users);
  }

  deleteUser(username: string) {
    this.users = this.users.filter((user) => user.username !== username);
  }

  updateUser(oldUser: User, newUser: User) {
    console.log('OLD: ' + json(oldUser));
    console.log('NEW: ' + json(newUser));

    this.users = this.users.map((user) => (user.username === oldUser.username ? newUser : user));
  }

  clearUsers() {
    console.log('CLEARING USERS');
    this.users = [];
  }

  getUser(username: string) {
    const user = this.users.find((user) => user.username === username);
    console.log(username);
    return user;
  }

  checkDuplicate(username: string) {
    const user = this.users.find((user) => user.username === username);
    return user !== undefined;
  }
}
const USER_KEY = Symbol('USER_KEY');

export function setUsersState() {
  return setContext(USER_KEY, new UsersState());
}

export function getUsersState() {
  return getContext<ReturnType<typeof setUsersState>>(USER_KEY);
}

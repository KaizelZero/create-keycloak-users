import { type Organization, type User } from '$lib/types';
import type { PageLoad } from './$types';

export const load = (async () => {
  const users: User[] = [];
  const organization: Organization = { name: '', url: '' };

  return {
    users,
    organization
  };
}) satisfies PageLoad;

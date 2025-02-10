import type { Organization, User } from '$lib/types';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatBitwardenData = (users: User[], organization: Organization) => {
  let formatted = '===================================\n';

  users.forEach((user) => {
    if (user.email) {
      formatted += `\n${user.email}\n`;
      formatted += `${organization.name} - ${user.username}\n\n`;
    } else {
      formatted += `\n${organization.name} - ${user.username}\n\n`;
    }

    formatted += `Username: ${user.username}\n`;
    formatted += `Password: ${user.password}\n`;
    formatted += `URL: ${organization.url}\n`;
    formatted += '\n===================================\n';
  });

  return formatted;
};

export const formatBitwardenCommands = (users: User[], organization: Organization) => {
  const UNLOCK_COMMAND = 'bw unlock';

  const userCommands = users.map((user) => {
    const credentials = [
      `Username: ${user.username}`,
      `Password: ${user.password}`,
      `URL: ${organization.url}`
    ].join('`n');

    return `bw send -n "${organization.name} - ${user.username}" -d 7 --hidden "${credentials}"`;
  });

  return [UNLOCK_COMMAND, ...userCommands].join('\n');
};

export function generateJsonOutput(users: User[], organization: Organization) {
  return JSON.stringify(
    {
      organization,
      users: users.map((user) => ({
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        credentials: [
          {
            type: 'password',
            value: user.password,
            temporary: true
          }
        ],
        realmRoles: [user.role],
        requiredActions: ['UPDATE_PASSWORD'],
        enabled: true
      }))
    },
    null,
    2
  );
}

export const credentialsUtils = {
  generatePassword(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    return Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join(
      ''
    );
  },

  capitalize(value: string): string {
    return value.replace(/\b\w/g, (char) => char.toUpperCase());
  }
};

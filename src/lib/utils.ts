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
      formatted += `${organization.name} - ${user.firstName} ${user.lastName}\n\n`;
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

    return `bw send -n "${organization.name} - ${user.firstName} ${user.lastName}" -d 7 --hidden "${credentials}"`;
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
  generatePassword(options?: {
    length?: number;
    uppercase?: boolean;
    lowercase?: boolean;
    numbers?: boolean;
    symbols?: boolean;
    avoidAmbiguous?: boolean;
  }): string {
    const {
      length = 12,
      uppercase = true,
      lowercase = true,
      numbers = true,
      symbols = true,
      avoidAmbiguous = true
    } = options || {};

    const charSets = {
      uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
      lowercase: 'abcdefghijklmnopqrstuvwxyz',
      numbers: '0123456789',
      // symbols: '!@#$%^&*()-_=+[]{}|;:,.<>?/`~'
      symbols: '!@#%^&*' // Remove $ because $ mess with powershell commands
    };

    const ambiguousChars = 'O0l1I';

    const ambiguousRegex = new RegExp(`[${ambiguousChars}]`, 'g');

    let allChars = '';
    const requiredChars: string[] = [];

    if (uppercase) {
      // Now we use the regex. This correctly removes both 'O' and 'I'.
      const chars = avoidAmbiguous
        ? charSets.uppercase.replace(ambiguousRegex, '')
        : charSets.uppercase;
      allChars += chars;
      requiredChars.push(randomChar(chars));
    }

    if (lowercase) {
      // The regex will correctly remove 'l'.
      const chars = avoidAmbiguous
        ? charSets.lowercase.replace(ambiguousRegex, '')
        : charSets.lowercase;
      allChars += chars;
      requiredChars.push(randomChar(chars));
    }

    if (numbers) {
      // The regex will correctly remove '0' and '1'.
      const chars = avoidAmbiguous
        ? charSets.numbers.replace(ambiguousRegex, '')
        : charSets.numbers;
      allChars += chars;
      requiredChars.push(randomChar(chars));
    }

    if (symbols) {
      allChars += charSets.symbols;
      requiredChars.push(randomChar(charSets.symbols));
    }

    if (!allChars) {
      throw new Error('At least one character set must be enabled.');
    }

    const remainingLength = length - requiredChars.length;
    const passwordChars = [...requiredChars];

    for (let i = 0; i < remainingLength; i++) {
      passwordChars.push(randomChar(allChars));
    }

    // Fisher–Yates shuffle
    for (let i = passwordChars.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [passwordChars[i], passwordChars[j]] = [passwordChars[j], passwordChars[i]];
    }

    return passwordChars.join('');
  },

  capitalize(value: string): string {
    return value.replace(/\b\w/g, (char) => char.toUpperCase());
  }
};

function randomChar(str: string): string {
  return str[Math.floor(Math.random() * str.length)];
}

import type { Organization, User } from '$lib/types';
import { type ClassValue, clsx } from 'clsx';
import { cubicOut } from 'svelte/easing';
import type { TransitionConfig } from 'svelte/transition';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type FlyAndScaleParams = {
  y?: number;
  x?: number;
  start?: number;
  duration?: number;
};

export const flyAndScale = (
  node: Element,
  params: FlyAndScaleParams = { y: -8, x: 0, start: 0.95, duration: 150 }
): TransitionConfig => {
  const style = getComputedStyle(node);
  const transform = style.transform === 'none' ? '' : style.transform;

  const scaleConversion = (valueA: number, scaleA: [number, number], scaleB: [number, number]) => {
    const [minA, maxA] = scaleA;
    const [minB, maxB] = scaleB;

    const percentage = (valueA - minA) / (maxA - minA);
    const valueB = percentage * (maxB - minB) + minB;

    return valueB;
  };

  const styleToString = (style: Record<string, number | string | undefined>): string => {
    return Object.keys(style).reduce((str, key) => {
      if (style[key] === undefined) return str;
      return str + `${key}:${style[key]};`;
    }, '');
  };

  return {
    duration: params.duration ?? 200,
    delay: 0,
    css: (t) => {
      const y = scaleConversion(t, [0, 1], [params.y ?? 5, 0]);
      const x = scaleConversion(t, [0, 1], [params.x ?? 0, 0]);
      const scale = scaleConversion(t, [0, 1], [params.start ?? 0.95, 1]);

      return styleToString({
        transform: `${transform} translate3d(${x}px, ${y}px, 0) scale(${scale})`,
        opacity: t
      });
    },
    easing: cubicOut
  };
};

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

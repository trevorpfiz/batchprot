import type { User } from '@repo/auth';

export function getNameFromUser(user: User) {
  const name = user.name;
  if (typeof name === 'string') {
    return name;
  }
  return 'User';
}

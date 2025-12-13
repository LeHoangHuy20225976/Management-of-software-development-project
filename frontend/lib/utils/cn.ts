/**
 * Class Name Utility (similar to clsx)
 * Merges Tailwind CSS classes safely
 */

type ClassValue = string | number | boolean | undefined | null | ClassValue[];

export function cn(...inputs: ClassValue[]): string {
  return inputs
    .flat()
    .filter(Boolean)
    .join(' ')
    .trim();
}

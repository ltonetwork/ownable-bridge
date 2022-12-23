import fs from 'fs/promises';

export default async function fileExists(path: string): Promise<boolean> {
  return await fs
    .access(path)
    .then(() => true)
    .catch(() => false);
}

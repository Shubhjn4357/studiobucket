import path from "path"
import os from "os"

export function getStorageRoot() {
  if (process.env.LOCAL_STORE === 'true') {
    return os.tmpdir()
  }
  if (process.env.NODE_ENV === "production") {
    return "/app/storage"
  }
  return path.join(/* turbopackIgnore: true */ process.cwd(), "public")
}

export function getStoragePath(subDir: string, ...parts: string[]) {
  return path.join(getStorageRoot(), subDir, ...parts)
}

/**
 * Get the absolute path for a given key relative to the storage root.
 * @param key The relative path from the storage root
 * @returns The absolute path on the filesystem
 */
export function getStorageAbsolutePath(key: string): string {
  return path.join(getStorageRoot(), key)
}

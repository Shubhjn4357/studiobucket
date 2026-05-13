import path from "path"

export function getStorageRoot() {
  if (process.env.NODE_ENV === "production") {
    return "/app/storage"
  }
  return path.join(process.cwd(), "public")
}

export function getStoragePath(subDir: string, ...parts: string[]) {
  return path.join(getStorageRoot(), subDir, ...parts)
}

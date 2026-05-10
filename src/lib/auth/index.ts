import { getServerSession } from "next-auth"
import { authOptions } from "./config"

export { authOptions } from "./config"

export async function getSession() {
  return await getServerSession(authOptions)
}

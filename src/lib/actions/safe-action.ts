import { createSafeActionClient } from "next-safe-action"
import { connectDB } from "@/lib/db/connection"

export const actionClient = createSafeActionClient({
  handleServerError(e) {
    console.error("Action error:", e.message)
    return e.message
  },
}).use(async ({ next }) => {
  await connectDB()
  return next()
})

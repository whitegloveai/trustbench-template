/* eslint-disable no-console */
import { initializeRBAC } from "@/server/queries/permissions"

async function seed() {
  try {
    console.log("🌱 Starting database seed...")
    console.log("📊 Initializing RBAC...")
    await initializeRBAC()
    console.log("✅ Seed completed successfully")
  } catch (error) {
    console.error("❌ Seed failed:", error)
    throw error
  }
}

// Immediately execute when file is run
seed().catch((err) => {
  console.error("Failed to seed database:", err)
  process.exit(1)
})

export { seed }

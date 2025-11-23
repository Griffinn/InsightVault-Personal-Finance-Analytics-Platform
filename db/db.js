// // backend/db/db.js
import sqlite3 from 'sqlite3'
import { open } from 'sqlite'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// Get the current directory of this file
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export async function getDBConnection() {
  const dbPath = path.join(__dirname, 'database.db')  // ✅ now it always uses /db/database.db
  console.log("Connected to DB:", dbPath)  // debug helper
  return open({
    filename: dbPath,
    driver: sqlite3.Database
  })
}

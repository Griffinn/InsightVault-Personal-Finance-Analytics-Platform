import sqlite3 from 'sqlite3'
import { open } from 'sqlite'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { users } from '../data/usersData.js'
import { transactions } from '../data/transactionsData.js'
import { wishlist } from '../data/wishlistData.js'
import { investments } from '../data/investmentsData.js'
import { card } from '../data/cardData.js'
import { vinyl } from '../data/vinylData.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)


async function seedTable() {
 
  const db = await open({
    filename: path.join(__dirname, 'database.db'),
    driver: sqlite3.Database
  })

  try {

    await db.exec('BEGIN TRANSACTION')

    // ---Users------
    for (const { name, email, password, created_at } of users) {
        await db.run(`
        INSERT INTO users (name, email, password, created_at)
        VALUES (?, ?, ?, ?)`,
        [name, email, password, created_at]
        ) 
    }

    // ---Transactions------
    for (const { user_id, date, title, type, category, amount, status, tag } of transactions) {
        await db.run(`
        INSERT INTO transactions (user_id, date, title, type, category, amount, status, tag)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [user_id, date, title, type, category, amount, status, tag]
        ) 
    }

    // ---Wishlist------
    for (const { user_id, item_name, target_amount, saved_amount, created_at } of wishlist) {
        await db.run(`
        INSERT INTO wishlist (user_id, item_name, target_amount, saved_amount, created_at)
        VALUES (?, ?, ?, ?, ?)`,
        [user_id, item_name, target_amount, saved_amount, created_at]
        ) 
    }

    // ---Investments------
    for (const { user_id, investment_type, investment_name, amount_invested, current_value, returns_percent, purchase_date, last_updated } of investments) {
        await db.run(`
        INSERT INTO investments (user_id, investment_type, investment_name, amount_invested, current_value, returns_percent, purchase_date, last_updated)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [user_id, investment_type, investment_name, amount_invested, current_value, returns_percent, purchase_date, last_updated]
        ) 
    }

    // ---Cards------
    for (const { user_id, card_type, card_number_last4, bank_name, card_holder_name, expiry_date, limit_amount, available_balance, status, created_at } of card) {
        await db.run(`
        INSERT INTO card (user_id, card_type, card_number_last4, bank_name, card_holder_name, expiry_date, limit_amount, available_balance, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [user_id, card_type, card_number_last4, bank_name, card_holder_name, expiry_date, limit_amount, available_balance, status, created_at]
        ) 
    }      

      

    await db.exec('COMMIT')
    console.log('All records inserted successfully.')

  } catch (err) {

    await db.exec('ROLLBACK')
    console.error('Error inserting data:', err.message)

  } finally {

    await db.close()
    console.log('Database connection closed.')
    
  }
}

seedTable()
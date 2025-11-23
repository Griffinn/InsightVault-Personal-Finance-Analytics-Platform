import sqlite3 from 'sqlite3'
import { open } from 'sqlite'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)


export async function viewAllProducts() {
  const db = await open({
    filename: path.join(__dirname, 'database.db'),
    driver: sqlite3.Database
  })

  try {
    const products = await db.all('SELECT * FROM products');
    console.table(products); 

    const users = await db.all('SELECT * FROM users');
    console.table(users); 

    const transactions = await db.all('SELECT * FROM transactions');
    console.table(transactions); 

    const wishlist = await db.all('SELECT * FROM wishlist');
    console.table(wishlist); 

    const investments = await db.all('SELECT * FROM investments');
    console.table(investments); 

    const card = await db.all('SELECT * FROM card');
    console.table(card); 

  } catch (err) {
    console.error('Error fetching products:', err.message);
  } finally {
    await db.close();
  }
}

viewAllProducts();
// queryTest.js
import { getDBConnection } from "./db.js";

async function runQuery() {
  try {
    const db = await getDBConnection();
    console.log("✅ Connected to DB");

    const start = "2025-01-01";
    const end = "2025-01-31";

    // 🟢 Step 1: show sample dates (to confirm format)
    const allDates = await db.all(`SELECT DISTINCT date FROM transactions ORDER BY date;`);
    console.log("\n🗓 Sample Dates from DB:");
    if (allDates.length === 0) {
      console.log("⚠️ No data found in transactions table.");
    } else {
      allDates.forEach((row, i) => console.log(`${i + 1}. ${row.date}`));
    }

    // 🟢 Step 2: test range query
    const query = `
      SELECT date, category, amount, type
      FROM transactions
      WHERE date BETWEEN ? AND ?
      ORDER BY date
    `;

    const result = await db.all(query, [start, end]);

    console.log(`\n📊 Transactions between ${start} and ${end}:`);
    if (result.length === 0) {
      console.log("⚠️ No transactions found for that range.");
    } else {
      // pretty print results in a small table format
      console.log("───────────────────────────────────────────────");
      console.log(" Date         | Category        | Amount | Type");
      console.log("───────────────────────────────────────────────");

      result.forEach((row) => {
        const date = row.date.padEnd(12, " ");
        const cat = (row.category || "-").padEnd(15, " ");
        const amt = String(row.amount).padEnd(7, " ");
        const type = row.type || "-";
        console.log(` ${date}| ${cat}| ${amt}| ${type}`);
      });

      console.log("───────────────────────────────────────────────");
      console.log(`✅ Total Rows: ${result.length}`);
    }

    await db.close();
    console.log("\n🔒 DB connection closed.");
  } catch (err) {
    console.error("❌ Error running query:", err);
  }
}

runQuery();

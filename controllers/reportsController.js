import { getDBConnection } from '../db/db.js';
import moment from "moment";

export const getTotalAmounts = async (req, res) => {
  try {
    const db = await getDBConnection();
    const { byCategory, byType, startDate, endDate } = req.query;

    // same format function used above
    const formatDate = (d) => {
      if (!d) return d;
      if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
      const parts = d.split("-");
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    };

    const start = formatDate(startDate);
    const end = formatDate(endDate);

    let query = "";
    if (byCategory === "active") {
      query = `
        SELECT category, SUM(amount) AS total
        FROM transactions
        WHERE date BETWEEN ? AND ?
        GROUP BY category
        ORDER BY total DESC
      `;
    } else if (byType === "active") {
      query = `
        SELECT type, SUM(amount) AS total
        FROM transactions
        WHERE date BETWEEN ? AND ?
        GROUP BY type
        ORDER BY total DESC
      `;
    } else {
      return res.status(400).json({ error: "Missing query parameter (byCategory or byType)" });
    }

    const rows = await db.all(query, [start, end]);

    if (rows.length === 0) {
      console.warn("No transactions found for that range.");
    }

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch total amounts" });
  }
};




export const getChangeOverTime = async (req, res) => {
  try {
    const db = await getDBConnection();
    const { byCategory, startDate, endDate } = req.query;

    if (byCategory !== "active") {
      return res.status(400).json({ error: "Only byCategory supported for now" });
    }

    // helper to normalize date format (DD-MM-YYYY → YYYY-MM-DD)
    const formatDate = (d) => {
      if (!d) return d;
      // if date already looks like YYYY-MM-DD, just return it
      if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
      // otherwise, convert from DD-MM-YYYY
      const parts = d.split("-");
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    };

    const start = formatDate(startDate);
    const end = formatDate(endDate);

    const transactions = await db.all(
      `
        SELECT date, category, SUM(amount) AS total
        FROM transactions
        WHERE date BETWEEN ? AND ?
        GROUP BY date, category
        ORDER BY date
      `,
      [start, end]
    );

    console.log("🔍 startDate (formatted):", start);
    console.log("🔍 endDate (formatted):", end);
    console.log("🔍 transactions fetched:", transactions);

    if (!transactions || transactions.length === 0) {
      console.warn("⚠️ No transactions found for that range.");
      return res.json([]); // empty response, no crash
    }

    // Get unique categories
    const categories = [...new Set(transactions.map((t) => t.category))];

    // Parse range
    const startObj = new Date(start);
    const endObj = new Date(end);

    // Build results day-by-day
    const result = [];
    for (let d = new Date(startObj); d <= endObj; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().slice(0, 10); // yyyy-mm-dd
      const dayData = { date: dateStr };

      categories.forEach((cat) => {
        const found = transactions.find(
          (t) => t.date === dateStr && t.category === cat
        );
        dayData[cat] = found ? found.total : 0;
      });

      result.push(dayData);
    }

    res.json(result);
  } catch (err) {
    console.error("Error in getChangeOverTime:", err);
    res.status(500).json({ error: "Failed to fetch change-over-time data" });
  }
};

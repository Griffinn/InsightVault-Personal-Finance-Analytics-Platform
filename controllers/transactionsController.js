import { getDBConnection } from '../db/db.js'

export async function getQueryParams(req, res){
    try{
        
        const db = await getDBConnection()

        const {type, category, startDate, endDate, search, sortBy, page = 1, limit = 15} = req.query

        let baseQuery = "FROM transactions WHERE 1=1";
        const params = []

        //Add filter dynamically
        if (type){
          baseQuery  += " AND type = ?";
          params.push(type);  
        }
        
        if (category){
            baseQuery  += " AND category = ?";
            params.push(category);
        }
        
        if (startDate){
            baseQuery  += " AND date >= ?";
            params.push(startDate);
        }
        
        if (endDate){
            baseQuery  += " AND date <= ?";
            params.push(endDate);
        }
        
        if (search){
            baseQuery  += ' AND title LIKE ?'
            const searchPattern = `%${search}%`
            params.push(searchPattern )
        }

        //////////------ADD THE AMOUNT FILTER AS WELL LATER ON------ ////////////// 

        // Total Count - metadata
        const countQuery = `SELECT COUNT(*) as total ${baseQuery}`;
        const countResult = await db.get(countQuery, params);
        const totalCount = countResult.total;
        const totalPages = Math.ceil(totalCount / limit);
        
        //Sorting
        let orderBy = "date DESC";

        if (sortBy) {
            const [column, order] = sortBy.split('_'); // e.g. ['amount', 'desc']
            const validColumns = ['date', 'amount', 'title'];
            const validOrder = ['asc', 'desc'];

            if (validColumns.includes(column) && validOrder.includes(order)) {
                if (column === 'amount') {
                    // Enforce numeric comparison for all stored types
                    orderBy = `CAST(amount AS REAL) ${order.toUpperCase()}, amount ${order.toUpperCase()}`;
                } else if (column === 'title') {
                    // Case-insensitive sorting for text
                    orderBy = `LOWER(title) ${order.toUpperCase()}`;
                } else {
                    orderBy = `${column} ${order.toUpperCase()}`;
                }
            }
        }


        
        // Pagination
        const offset = (parseInt(page) - 1) * parseInt(limit);

        // 🧠 final query
        const dataQuery = `
        SELECT * ${baseQuery}
        ORDER BY ${orderBy}
        LIMIT ? OFFSET ?
        `;
        const data = await db.all(dataQuery, [...params, parseInt(limit), offset]);

        // ✅ send structured response
        res.json({
        metadata: {
            total_count: totalCount,
            total_pages: totalPages,
            current_page: Number(page),
            limit: Number(limit),
            sort_by: orderBy
        },
        transactions: data
        });
  
    } catch(err){
        console.log(err)
        res
            .status(500)
            .json({error: 'Failed to fetch transactions', details: err.message})
    }
}

export async function getPathParams(req, res) {
    try {
        const db = await getDBConnection()   
        
        const { id } = req.params
        const rows = await db.all("SELECT * FROM transactions WHERE id = ?", [id])

        if (rows.length === 0) {
            return res.status(404).json({ error: "Transaction not found" })
        }
        res.json(rows[0])

    } catch (err) {
        console.log(err)
        res.status(500).json({
            error: 'Failed to fetch transaction', 
            details: err.message
        })
    }
}

export async function createTransaction(req, res) {
  try {
    const db = await getDBConnection()   

    const { user_id, date, title, type, category, amount, status, tag } = req.body

    if (!user_id || !date || !title || !type || !category || !amount || !status) {
      return res.status(400).json({ error: "Missing required fields" })
    }

    const result = await db.run(
      `INSERT INTO transactions (user_id, date, title, type, category, amount, status, tag)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [user_id, date, title, type, category, amount, status, tag]
    )

    const newTransaction = await db.get("SELECT * FROM transactions WHERE id = ?", [result.lastID])

    res.status(201).json({
      message: "Transaction added successfully",
      transaction: newTransaction
    })
  } catch (err) {
    res.status(500).json({ error: "Failed to create transaction", details: err.message })
  }
}

export async function getCategories(req, res) {

  try {

    const db = await getDBConnection() 

    const categoryRows = await db.all('SELECT DISTINCT category FROM transactions')
    const categories = categoryRows.map(row => row.category)
    res.json(categories)

  } catch (err) {
    console.log(err)
    // res.status(500).json({error: 'Failed to fetch categories', details: err.message})

  }
}


//Summary 
export async function getSummary(req, res) {
  try {
    const db = await getDBConnection();

    const { startDate, endDate, category, type, search } = req.query;
    let query = "SELECT * FROM transactions WHERE 1=1";
    const params = [];

    if (startDate) {
      query += " AND date >= ?";
      params.push(startDate);
    }
    if (endDate) {
      query += " AND date <= ?";
      params.push(endDate);
    }
    if (category) {
      query += " AND category = ?";
      params.push(category);
    }
    if (type) {
      query += " AND type = ?";
      params.push(type);
    }
    if (search) {
      query += " AND (title LIKE ? OR category LIKE ?)";
      params.push(`%${search}%`, `%${search}%`);
    }

    const transactions = await db.all(query, params);

    const totalTransactions = transactions.length;
    const totalSpending = transactions.reduce((sum, t) => sum + Number(t.amount || 0), 0);
    const largestTransaction = transactions.length ? Math.max(...transactions.map(t => Number(t.amount || 0))) : 0;
    const averageTransaction = totalTransactions ? totalSpending / totalTransactions : 0;

    res.json({
      totalTransactions,
      largestTransaction,
      averageTransaction,
      totalSpending
    });

  } catch (err) {
    console.error("Failed to compute summary:", err);
    res.status(500).json({ error: "Failed to compute summary", details: err.message });
  }
}


//Make for Update and Delete Later
import express from 'express'
import path from 'node:path'
import { transactionsApiRouter } from './routes/transactionsApi.js'
import { reportsApiRouter } from './routes/reportsApi.js'
import { wishlistApiRouter } from "./routes/wishlistApi.js"
import { dashboardApiRouter } from "./routes/dashboardApi.js"
import { fileURLToPath } from 'node:url'

const PORT = 8000
const app = express()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

//serving the frontend files
app.use(express.static('../frontend'))


// Transactions Module | API
app.use('/api/transactions', transactionsApiRouter)
app.use('/api/reports', reportsApiRouter)
app.use("/api/wishlist", wishlistApiRouter);
app.use("/api/dashboard", dashboardApiRouter);



//404 Page
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, "../frontend/404.html"));
});
 

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`)
})
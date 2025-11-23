import express from 'express'
import { getQueryParams, getPathParams, getCategories, getSummary, createTransaction } from '../controllers/transactionsController.js'

export const transactionsApiRouter = express.Router()

transactionsApiRouter.get('/', getQueryParams)
transactionsApiRouter.get('/categories', getCategories)
transactionsApiRouter.get('/summary', getSummary)
transactionsApiRouter.get('/:id', getPathParams)
transactionsApiRouter.post("/", createTransaction) 

// transactionsApiRouter.put("/:id", updateTransaction)     for future upgrade
// transactionsApiRouter.delete("/:id", deleteTransaction)      for future upgrade


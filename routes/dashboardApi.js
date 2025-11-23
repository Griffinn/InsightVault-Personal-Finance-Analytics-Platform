// routes/dashboardRoutes.js

import express from 'express';
import { getDashboardSummary } from '../controllers/dashboardController.js';

export const dashboardApiRouter = express.Router();

// Define the route for fetching the dashboard summary data
dashboardApiRouter.get('/summary', getDashboardSummary);



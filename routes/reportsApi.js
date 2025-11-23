import express from "express";
import { getTotalAmounts, getChangeOverTime } from "../controllers/reportsController.js";

export const reportsApiRouter = express.Router();

// http://localhost:8000/api/reports/total-amounts?byCategory=active&startDate=01-01-2025&endDate=31-03-2025
reportsApiRouter.get("/total-amounts", getTotalAmounts);

// http://localhost:8000/api/reports/change-over-time?byCategory=active&startDate=01-01-2025&endDate=31-03-2025
reportsApiRouter.get("/change-over-time", getChangeOverTime);




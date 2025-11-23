// controllers/dashboardController.js
import { getDBConnection } from '../db/db.js';


/**
 * Helper function to calculate the previous month's YYYY-MM string.
 * @param {Date} date - The current date object.
 * @returns {string} The 'YYYY-MM' string for the previous month.
 */
function getPreviousMonthString(date) {
    const prevDate = new Date(date);
    // Go back one month
    prevDate.setMonth(date.getMonth() - 1);
    
    const year = prevDate.getFullYear();
    const month = prevDate.getMonth() + 1; 

    return `${year}-${String(month).padStart(2, '0')}`;
}

/**
 * Calculates the percentage change and trend between two values.
 * @param {number} current - The current month's total.
 * @param {number} previous - The previous month's total.
 * @returns {{percentage: string, trend: string}} The formatted percentage and 'up'/'down'.
 */
function calculateComparison(current, previous) {
    if (previous === 0) {
        // Avoid division by zero. If previous was 0, it's a huge (or infinite) change.
        return { percentage: current > 0 ? '100%' : '0%', trend: current > 0 ? 'up' : 'down' };
    }
    
    // Calculate the percentage change: (current - previous) / previous * 100
    const change = ((current - previous) / previous) * 100;
    
    const trend = change >= 0 ? 'up' : 'down';
    const percentage = `${Math.abs(change).toFixed(1)}%`;
    
    return { percentage, trend };
}


export const getDashboardSummary = async (req, res) => {
    try {
        const db = await getDBConnection();
        
        // --- Date setup for current and previous month ---
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth() + 1; 
        const currentMonthString = `${year}-${String(month).padStart(2, '0')}`;
        const previousMonthString = getPreviousMonthString(today);

        // --- 1. Total Balance ---
        const totalBalanceQuery = `
            SELECT SUM(amount) AS totalBalance
            FROM transactions
        `;
        const totalBalanceResult = await db.get(totalBalanceQuery);
        const totalBalance = totalBalanceResult.totalBalance || 0;


        // --- 2. Monthly Metrics (Current Month) ---
        const currentMonthlyMetricsQuery = `
            SELECT type, SUM(amount) AS total
            FROM transactions
            WHERE strftime('%Y-%m', date) = ?
            GROUP BY type
        `;
        const currentMetrics = await db.all(currentMonthlyMetricsQuery, [currentMonthString]);

        let monthlyIncome = 0;
        let monthlyExpense = 0;
        let monthlySavings = 0;
        
        for (const metric of currentMetrics) {
            switch (metric.type) {
                case 'income':
                    monthlyIncome = metric.total;
                    break;
                case 'expense':
                    // Store expense as positive for display
                    monthlyExpense = Math.abs(metric.total); 
                    break;
                case 'savings':
                    monthlySavings = metric.total;
                    break;
            }
        }
        
        
        // --- 3. Monthly Metrics (Previous Month) for Comparison ---
        const previousMonthlyMetricsQuery = `
            SELECT type, SUM(amount) AS total
            FROM transactions
            WHERE strftime('%Y-%m', date) = ?
            AND type = 'income' -- Only fetching income for comparison demo
        `;
        const previousIncomeResult = await db.get(previousMonthlyMetricsQuery, [previousMonthString]);
        const previousMonthlyIncome = previousIncomeResult ? previousIncomeResult.total : 0;
        
        
        // --- 4. Calculate Comparison ---
        // Applying dynamic comparison ONLY to Monthly Income for demonstration
        const incomeComparison = calculateComparison(monthlyIncome, previousMonthlyIncome);
        
        // Using static 2.5% for Balance, Expense, and Savings for now (similar to your previous request)
        const staticComparison = { percentage: '2.5%', trend: 'up' }; 


        // --- 5. Send the Final Data ---
        res.json({
            // Core Metrics
            totalBalance: parseFloat(totalBalance).toFixed(2),
            monthlyIncome: parseFloat(monthlyIncome).toFixed(2),
            monthlyExpense: parseFloat(monthlyExpense).toFixed(2),
            monthlySavings: parseFloat(monthlySavings).toFixed(2),
            
            // Comparison Data (Using the structured keys the frontend expects)
            // Note: In a real app, you would calculate these individually for each metric.
            totalBalanceComparison: staticComparison,
            monthlyIncomeComparison: incomeComparison, // Dynamic value
            monthlyExpenseComparison: staticComparison,
            monthlySavingsComparison: staticComparison,
        });

    } catch (error) {
        console.error('Database query error:', error);
        res.status(500).json({ message: 'Error fetching dashboard data' });
    }
};
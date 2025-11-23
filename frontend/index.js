export function navbarOptionsHighlight() {
    const navItems = document.querySelectorAll("#middle .flex-item1, #bottom .flex-item2");

    const currentPath = window.location.pathname.split("/").pop();  
    // example: "reports.html"

    navItems.forEach(item => {
        const link = item.querySelector("a");

        if (link) {
            const linkPath = link.getAttribute("href");
            
            if (linkPath === `./${currentPath}` || linkPath === currentPath) {
                item.classList.add("nav-active");
            }
        }

        // also add click highlight for SPA-like feel
        item.addEventListener("click", () => {
            navItems.forEach(i => i.classList.remove("nav-active"));
            item.classList.add("nav-active");
        });
    });
}


// dashboard.js (Final Corrected Version)

/**
 * Finds the necessary elements within a card and updates their content.
 * @param {string} cardId - The ID of the outer card element (e.g., 'total-balance').
 * @param {string} value - The main numerical value to display.
 * @param {{percentage: string, trend: string}} comparison - Object containing percentage and trend.
 */
function updateMetric(cardId, value, comparison) {
    const cardElement = document.getElementById(cardId);
    if (!cardElement) return;

    // Safely extract data
    // Use 0% and 'up' as default if comparison object is missing/incomplete
    const percentage = comparison?.percentage || '0%'; 
    const trend = comparison?.trend || 'up';

    // 1. Update the total value element (<p class="sum-total">)
    const valueElement = cardElement.querySelector('.sum-total');
    
    // 2. Update the comparison span element (<span class="green">)
    const outerBox = cardElement.closest('.finance-info-outerbox');
    const comparisonSpan = outerBox ? outerBox.querySelector('.monthly-compare-data .green') : null;

    // Determine the icon and color
    const iconClass = trend === 'up' ? 'fa-caret-up' : 'fa-caret-down';
    const colorClass = trend === 'up' ? 'green' : 'red';

    // Format and update the main value (ensure value is treated as a number)
    const formattedValue = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
    }).format(Number(value));

    if (valueElement) {
        valueElement.textContent = formattedValue;
    }
    
    // Update the comparison span content and class
    if (comparisonSpan) {
        comparisonSpan.classList.remove('green', 'red'); 
        comparisonSpan.classList.add(colorClass); 
        comparisonSpan.innerHTML = `<i class="fa-solid ${iconClass}"></i> ${percentage}`;
    }
}


/**
 * Fetches dashboard summary data from the server and updates the UI.
 */
async function fetchDashboardSummary() {
    const apiEndpoint = '/api/dashboard/summary'; 

    try {
        const response = await fetch(apiEndpoint);
        
        if (!response.ok) {
             throw new Error(`Server error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // --- Map API data to updateMetric calls ---
        updateMetric('total-balance', data.totalBalance, data.totalBalanceComparison);
        updateMetric('monthy-income', data.monthlyIncome, data.monthlyIncomeComparison); 
        updateMetric('monthly-expense', data.monthlyExpense, data.monthlyExpenseComparison);
        updateMetric('monthly-savings', data.monthlySavings, data.monthlySavingsComparison);

    } catch (error) {
        console.error("Failed to fetch dashboard summary:", error);
        
        // --- Fallback to show clear error state ---
        const metricIds = ['total-balance', 'monthy-income', 'monthly-expense', 'monthly-savings'];
        
        metricIds.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                 const valueElement = element.querySelector('.sum-total');
                 if (valueElement) valueElement.textContent = '$ N/A';
                 
                 const outerBox = element.closest('.finance-info-outerbox');
                 const comparisonSpan = outerBox ? outerBox.querySelector('.monthly-compare-data .green') : null;
                 if (comparisonSpan) {
                     comparisonSpan.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> Failed to Load';
                     comparisonSpan.classList.remove('green');
                     comparisonSpan.classList.add('red');
                 }
            }
        });
    }
}







document.addEventListener("DOMContentLoaded", () => {
  navbarOptionsHighlight(); 
  fetchDashboardSummary();
}); 





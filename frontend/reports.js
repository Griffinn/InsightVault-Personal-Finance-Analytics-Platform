///---------------Navbar Highlight-------------------///
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


///---------------------------Global Variables----------------------------///
const container = document.querySelector(".cards-container")
const paginationContainer = document.querySelector("#pagination");


let currentPage = 1;
let currentSort = "date_desc";
let currentFilters = {
  category: "", 
  type: "",
  startDate: "",
  endDate: ""
};

let limit = 20;
let currentSearch = "";



//-----------------2. Fetch Transaction Data--------------------///
export async function fetchTransactions() {

  try {
    // Build query params dynamically
    const params = new URLSearchParams({
      page: currentPage,
      limit,
      sortBy: currentSort,
    });

    //search
    if (currentSearch) params.append("search", currentSearch);

    //filters
    Object.entries(currentFilters).forEach(([key, value]) => {
      if (value && value !== "All") params.append(key, value);
    });


    // Fetch data
    const response = await fetch(`/api/transactions?${params.toString()}`);
    const data = await response.json();

    // Safety check
    if (!data.transactions) {
      console.error("No transactions received", data);
      return;
    }

    // Render transactions
    renderCards(data.transactions);
    renderPagination(data.metadata);
    fetchSummary();


    // Optional: handle pagination UI
    console.log("Metadata: ", data.metadata);
  } catch (error) {
    console.error("Failed to fetch transactions:", error);
  }
}

///------------------Render Transaction Cards in website---------------///
export async function renderCards(cardsData) {
  if (!container) return console.error("Missing .cards-container in HTML");

  if (!cardsData || cardsData.length === 0) {
    container.innerHTML = "<p>No transactions found 😔</p>";
    return;
  }

  let cardsHTML = "";

  // 🧠 If sorting by date, group them by date
  if (currentSort.startsWith("date")) {
    const grouped = cardsData.reduce((acc, t) => {
      if (!acc[t.date]) acc[t.date] = [];
      acc[t.date].push(t);
      return acc;
    }, {});

    Object.entries(grouped).forEach(([date, txns]) => {
      const total = txns.reduce((sum, t) => sum + Number(t.amount || 0), 0);

      cardsHTML += `
        <div class="date-header">
          <span>${new Date(date).toDateString()}</span>
          <span class="daily-total">+$${total}</span>
        </div>
      `;

      txns.forEach((card, i) => {
        cardsHTML += `
          <div class="card grid-container" aria-labelledby="transactions-title-${i}">
            <p class="title grid-item">${card.title}</p>
            <p class="category grid-item">${card.category}</p>
            <p class="amount grid-item">+$${card.amount} <i class="fa-solid fa-chevron-right"></i></p>
          </div>
        `;
      });
    });
  } 
  else {
    // For amount/title sorting — still show date headers but don’t regroup
    let lastDate = null;

    cardsData.forEach((card, i) => {
      // whenever date changes, insert the header with total for that date
      if (card.date !== lastDate) {
        const totalForDate = cardsData
          .filter((t) => t.date === card.date)
          .reduce((sum, t) => sum + Number(t.amount || 0), 0);

        cardsHTML += `
          <div class="date-header">
            <span>${new Date(card.date).toDateString()}</span>
            <span class="daily-total">+$${totalForDate}</span>
          </div>
        `;
        lastDate = card.date;
      }

      // render the actual transaction card
      cardsHTML += `
        <div class="card grid-container" aria-labelledby="transactions-title-${i}">
          <p class="title grid-item">${card.title}</p>
          <p class="category grid-item">${card.category}</p>
          <p class="amount grid-item">+$${card.amount} <i class="fa-solid fa-chevron-right"></i></p>
        </div>
      `;
    });
  }

  container.innerHTML = cardsHTML;
}




////-----------------PAGINATION----------------------///
export async function renderPagination(meta) {
  paginationContainer.innerHTML = "";

  for (let i = 1; i <= meta.total_pages; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    btn.className = `btn btn-sm ${i === currentPage ? "btn-primary" : "btn-outline-primary"}`;
    btn.addEventListener("click", () => {
      currentPage = i;
      fetchTransactions();
      fetchSummary();
    });
    paginationContainer.appendChild(btn);
  }
}


///-----------------------SORT BY---------------------///
export async function sortByFilter(){
  const sortDropdownItems = document.querySelectorAll(".dropdown-1-item");

  sortDropdownItems.forEach((item) => {
    item.addEventListener("click", (e) => {
      e.preventDefault();

      const text = item.textContent.trim();

      switch (text) {
        case "Date (New to Old)":
          currentSort = "date_desc";
          break;
        case "Date (Old to New)":
          currentSort = "date_asc";
          break;
        case "Amount (Largest to Smallest)":
          currentSort = "amount_desc";
          break;
        case "Amount (Smallest to Largest)":
          currentSort = "amount_asc";
          break;
        case "Name (A to Z)":
          currentSort = "title_asc";
          break;
        case "Name (Z to A)":
          currentSort = "title_desc";
          break;
        default:
          currentSort = "date_desc";
      }

      currentPage = 1;

      const sortButton = document.querySelector("#SortBy-dropdown");
      if (sortButton) {
        sortButton.textContent = text;
      }

      fetchTransactions();
      fetchSummary();
    });
  });
}

///--- Search Functionality ---///
export async function searchFilter(){
  const searchInput = document.querySelector(".search-input-2");
  let searchTimeout;

  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      clearTimeout(searchTimeout); // debounce for smoother UX
      const value = e.target.value.trim();

      searchTimeout = setTimeout(() => {
        currentSearch = value;
        currentPage = 1; // reset to first page for new search
        
        fetchTransactions();
        fetchSummary();
      }, 400); // 400ms delay before triggering search
    });
  }
}


///----Populate the Category Selector Dropdown-----///
export async function categorySelector() {
  try{
    //dropdown menu data fetched fromapi, what categories we have
    const res = await fetch('/api/transactions/categories')
    const categories = await res.json() // expects an array of genres as strings: ['rock', 'pop', ...]
    const dropdown = document.querySelector('#categories-dropdown')

    let dropdownHTML = '<li><a class="dropdown-item dropdown-2-item" href="#">All Categories</a></li>'

    categories.forEach(category => {
        dropdownHTML += `
          <li><a class="dropdown-item dropdown-2-item" href="#">${category}</a></li>
        `;
    })

    dropdown.innerHTML = dropdownHTML

    // handle clicks
    dropdown.querySelectorAll('.dropdown-2-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const selectedCategory = e.target.textContent.trim();

        const button = document.querySelector('#Categories-dropdown-button');
        button.textContent = selectedCategory;

        // update filters object
        // currentFilters.category = selectedCategory;
        currentFilters.category = selectedCategory === "All Categories" ? "" : selectedCategory;
        currentPage = 1;
        fetchTransactions();
        fetchSummary();
      });
    });

  }catch(err){
    console.error("Error loading categories:", err);
  }
}


///----Type Filter-----///
export async function typeSelector() {
  const dropdown = document.querySelector("#Type-dropdown");
  const button = document.querySelector("#Type-dropdown-btn");

  // Attach click listeners to all dropdown items
  dropdown.querySelectorAll(".dropdown-3-item").forEach((item) => {
    item.addEventListener("click", (e) => {
      e.preventDefault();
      const selectedType = e.target.textContent.trim();

      // Update button text
      button.textContent = selectedType;

      // Update global filters object
      currentFilters.type = selectedType === "All Types" ? "" : selectedType.toLowerCase();

      // Reset pagination and fetch
      currentPage = 1;
      fetchTransactions();
      fetchSummary();
    });
  });
}


//--------Date Selector------------
export async function setupDateFilter() {
  const startInput = document.querySelector("#startDate-input-1");
  const endInput = document.querySelector("#startDate-input-2");

  if (!startInput || !endInput) {
    console.error("Date inputs not found!");
    return;
  }



  // Common handler for both
  function updateDateFilters() {
    const start = startInput.value ? new Date(startInput.value).toISOString().split("T")[0] : "";
    const end = endInput.value ? new Date(endInput.value).toISOString().split("T")[0] : "";

    currentFilters.startDate = start;
    currentFilters.endDate = end;

    currentPage = 1;
    fetchTransactions();
    fetchSummary();
  }

  startInput.addEventListener("change", updateDateFilters);
  endInput.addEventListener("change", updateDateFilters);
}

///-------Summary--------///
async function fetchSummary() {
  try {
    const params = new URLSearchParams();

    if (currentFilters.category) params.append("category", currentFilters.category);
    if (currentFilters.type) params.append("type", currentFilters.type);
    if (currentFilters.startDate) params.append("startDate", currentFilters.startDate);
    if (currentFilters.endDate) params.append("endDate", currentFilters.endDate);
    if (currentSearch) params.append("search", currentSearch);

    const res = await fetch(`/api/transactions/summary?${params.toString()}`);
    const data = await res.json();

    document.getElementById("summary-total").textContent = data.totalTransactions || 0;
    document.getElementById("summary-largest").textContent = `$${data.largestTransaction?.toFixed(2) || 0}`;
    document.getElementById("summary-average").textContent = `$${data.averageTransaction?.toFixed(2) || 0}`;
    document.getElementById("summary-spending").textContent = `$${data.totalSpending?.toFixed(2) || 0}`;
  } catch (error) {
    console.error("Failed to fetch summary:", error);
  }
}



///-------ADD THE POSTING PART OF TRANSACTIONS---------///






//-------------------------------------------------------------------------REPORTS PART-------------------------------------------------------------------///

//1. This Month Button //


// // ----------------------------------------------------
// // DATE RANGE FUNCTION
// // ----------------------------------------------------
function getDateRange(option) {
    const today = new Date();
    let startDate, endDate;

    switch (option) {
        case "This Week": {
            const day = today.getDay(); // Sun=0, Mon=1...
            const diff = today.getDate() - day + (day === 0 ? -6 : 1);
            startDate = new Date(today.setDate(diff));
            endDate = new Date();
            break;
        }

        case "This Month": {
            startDate = new Date(today.getFullYear(), today.getMonth(), 1);
            endDate = today;
            break;
        }

        case "This Quarter": {
            const quarter = Math.floor(today.getMonth() / 3);
            startDate = new Date(today.getFullYear(), quarter * 3, 1);

            const endMonth = (quarter * 3) + 2;
            endDate = new Date(today.getFullYear(), endMonth + 1, 0);
            break;
        }

        case "This Year": {
            startDate = new Date(today.getFullYear(), 0, 1);
            endDate = today;
            break;
        }

        default:
            startDate = endDate = today;
    }


    return {
        startDate: formatDate(startDate),
        endDate: formatDate(endDate)
    };
}


// ----------------------------------------------------
//  FORMAT yyyy-mm-dd
// ----------------------------------------------------
function formatDate(date) {
    return date.toISOString().split("T")[0];
}


// ----------------------------------------------------
// FETCH DATA FROM BACKEND
// ----------------------------------------------------
async function fetchReportData(startDate, endDate) {
    try {
        const res = await fetch(
            `/api/reports/total-amounts?byCategory=active&startDate=${startDate}&endDate=${endDate}`
        );

        const data = await res.json();

        // ⭐ Call graph function right here
        renderCategoryPieChart(data);

        // ⭐ Always return array to prevent crashes
        return Array.isArray(data) ? data : [];

    } catch (err) {
        console.error("Error fetching report data:", err);
        return [];
    }
}



// ----------------------------------------------------
//Chart creating function
// ----------------------------------------------------
let changeOverTimeChartInstance = null;

let categoryChartInstance = null;

/*
function renderCategoryPieChart(data) {
    const labels = data.map(item => item.category);
    const totals = data.map(item => item.total);

    const ctx = document.getElementById("categoryPieCanvas").getContext("2d");

    if (categoryChartInstance) {
        categoryChartInstance.destroy();
    }

    categoryChartInstance = new Chart(ctx, {
        type: "bar",
        data: {
            labels: labels,
            datasets: [
                {
                    data: totals,
                    borderWidth: 1,
                    backgroundColor: [
                          "#FF6B6B", // Red-ish
                          "#FF8E72", // Coral
                          "#FFB56B", // Orange
                          "#FFD93D", // Yellow
                          "#6BCB77", // Green
                          "#4D96FF", // Blue
                          "#845EC2", // Purple
                          "#FF63A5", // Pink
                          "#00C9A7", // Teal
                          "#FF9F1C", // Tangerine
                          "#F15BB5", // Hot pink
                          "#00BFFF", // Deep Sky Blue
                          "#FF6F61", // Salmon
                          "#8AC926", // Lime Green
                          "#1982C4", // Strong Blue
                          "#6A4C93", // Deep Purple
                          "#FFBE0B", // Bright Yellow
                          "#FF006E", // Vivid Pink
                          "#06D6A0", // Aqua Green
                          "#8338EC"  // Electric Purple
                    ]
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: true,
                    position: "right", // legend appears on the side
                    labels: {
                        boxWidth: 20,
                        padding: 15,
                    }
                }
            }
        }
    });
}
*/

///-------------------------------------------------///
///-----------BAR CHART----------------------------///
///------------------------------------------------///


// function renderCategoryPieChart(data) {
//     const labels = data.map(item => item.category);
//     const totals = data.map(item => item.total);

//     const ctx = document.getElementById("categoryPieCanvas").getContext("2d");

//     if (categoryChartInstance) {
//         categoryChartInstance.destroy();
//     }

//     categoryChartInstance = new Chart(ctx, {
//         type: "bar",
//         data: {
//             labels: labels,
//             datasets: [
//                 {
//                     label: "Total Spending",   // 🔥 REQUIRED for legend
//                     data: totals,
//                     borderWidth: 1,
//                     backgroundColor: [
//                         "#FF6B6B", "#FF8E72", "#FFB56B", "#FFD93D",
//                         "#6BCB77", "#4D96FF", "#845EC2", "#FF63A5",
//                         "#00C9A7", "#FF9F1C", "#F15BB5", "#00BFFF",
//                         "#FF6F61", "#8AC926", "#1982C4", "#6A4C93",
//                         "#FFBE0B", "#FF006E", "#06D6A0", "#8338EC"
//                     ]
//                 }
//             ]
//         },
//         options: {
//             responsive: true,
//             maintainAspectRatio: false,
//             plugins: {
//                 legend: {
//                     display: true,
//                     position: "right",
//                     labels: {
//                         boxWidth: 20,
//                         padding: 15
//                     }
//                 }
//             },
//             scales: {
//                 y: {
//                     beginAtZero: true
//                 }
//             }
//         }
//     });
// }


function renderCategoryPieChart(data) {
    const labels = data.map(item => item.category);
    const totals = data.map(item => item.total);

    const colors = [
        "#FF6B6B", "#FF8E72", "#FFB56B", "#FFD93D",
        "#6BCB77", "#4D96FF", "#845EC2", "#FF63A5",
        "#00C9A7", "#FF9F1C", "#F15BB5", "#00BFFF",
        "#FF6F61", "#8AC926", "#1982C4", "#6A4C93",
        "#FFBE0B", "#FF006E", "#06D6A0", "#8338EC"
    ];

    const ctx = document.getElementById("categoryPieCanvas").getContext("2d");

    if (categoryChartInstance) {
        categoryChartInstance.destroy();
    }

    categoryChartInstance = new Chart(ctx, {
        type: "bar",
        data: {
            labels: labels,
            datasets: [
                {
                    label: "Total Spending",
                    data: totals,
                    backgroundColor: colors,
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false // hide chart.js legend
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    // ---------- CUSTOM LEGEND ----------
    const legendBox = document.getElementById("categoryLegend");
    legendBox.innerHTML = "";

    const totalSum = totals.reduce((a, b) => a + b, 0);

    labels.forEach((label, index) => {
        const percent = ((totals[index] / totalSum) * 100).toFixed(1);

        const item = document.createElement("div");
        item.classList.add("legend-item");

        const colorBox = document.createElement("span");
        colorBox.classList.add("legend-color");
        colorBox.style.backgroundColor = colors[index];

        const text = document.createElement("span");
        text.textContent = `${label} — ₹${totals[index]} (${percent}%)`;

        item.appendChild(colorBox);
        item.appendChild(text);

        legendBox.appendChild(item);
    });
}








///-----------------------------////
///Setup the button - This month ///
///-----------------------------///



function setupDurationSelector(){

    const dropdownItems = document.querySelectorAll("#time-selector-dropdown .dropdown-item");
    const dropdownBtn = document.querySelector("#time-selector-btn");

    dropdownItems.forEach(item => {
        item.addEventListener("click", async () => {
            const selected = item.textContent.trim();

            // Update button text
            dropdownBtn.innerHTML = `${selected} <i class="fa-solid fa-calendar"></i>`;

            //Get date range
            const { startDate, endDate } = getDateRange(selected);

            console.log("Selected:", selected);
            console.log("Range:", startDate, endDate);

            // Fetch report data from backend
            const reportData = await fetchReportData(startDate, endDate);

            console.log("Report Data:", reportData);
        });
    });
        
    
}











// //-------------------------------------------------------------------iNITIALIZATION--------------------------------------------------------------------------///
document.addEventListener("DOMContentLoaded", async() => {
  setupDurationSelector();
  fetchTransactions();
  sortByFilter();
  searchFilter();
  categorySelector();
  typeSelector();
  setupDateFilter();
  fetchSummary();
  navbarOptionsHighlight();

  // Fetch default “This Month” data immediately
  const { startDate, endDate } = getDateRange("This Week");
  await fetchReportData(startDate, endDate);
})
 


// // To highlight the option selected in the navbar by creating an elevated-looking div with css
// export async function navbarOptionsHighlight(){
//   const navbar_pages = document.getElementsByClassName("flex-item1")
//   const navbar_options = document.getElementsByClassName("flex-item2")

//   for(var i = 0; i <= 5; i++){
//       navbar_pages[i].addEventListener("click", () => {
//           alert("I got clicked!");                                // change this alert to making the div highlighted css
//       })
//   }

//   for(var i = 0; i <= 1; i++){                                    // adding event listener for just 2 items bcoz 3rd is the logout button 
//       navbar_options[i].addEventListener("click", () => {
//           alert("I got clicked!");                                // change this alert to making the div highlighted css
//       })
//   }
// }


///---------------Navbar Highlight-----------///
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



//////////////////-------ADD THE POSTING PART OF TRANSACTIONS---------////////////////////////






//Initial Loading
document.addEventListener("DOMContentLoaded", () => {
  fetchTransactions();
  sortByFilter();
  searchFilter();
  categorySelector();
  typeSelector();
  setupDateFilter();
  fetchSummary();
  navbarOptionsHighlight();
  
}); 


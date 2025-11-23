
// 1. To highlight the option selected in the navbar by creating an elevated-looking div with css

// const navbar_pages = document.getElementsByClassName("flex-item1")
// const navbar_options = document.getElementsByClassName("flex-item2")

// for(var i = 0; i <= 5; i++){
//     navbar_pages[i].addEventListener("click", () => {
//         alert("I got clicked!");                                // change this alert to making the div highlighted css
//     })
// }

// for(var i = 0; i <= 1; i++){                                    // adding event listener for just 2 items bcoz 3rd is the logout button 
//     navbar_options[i].addEventListener("click", () => {
//         alert("I got clicked!");                                // change this alert to making the div highlighted css
//     })
// }


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

// ---------------------------
// FORMAT MONEY
// ---------------------------
function formatCurrency(amount) {
    return "₹" + amount.toLocaleString("en-IN");
}

// ---------------------------
// FETCH WISHLIST FROM BACKEND
// ---------------------------
async function fetchWishlist() {
    try {
        const res = await fetch("/api/wishlist");
        const json = await res.json();

        if (!json.success || !Array.isArray(json.data)) {
            console.error("Invalid wishlist response:", json);
            return [];
        }

        return json.data;

    } catch (err) {
        console.error("Error fetching wishlist:", err);
        return [];
    }
}

// ---------------------------
// CREATE A CARD
// ---------------------------


const wishlistImages = [
    //Money money money
    // "https://images.pexels.com/photos/4386471/pexels-photo-4386471.jpeg?auto=compress&cs=tinysrgb&w=1200",
    // "https://images.pexels.com/photos/4386404/pexels-photo-4386404.jpeg?auto=compress&cs=tinysrgb&w=1200",
    // "https://images.pexels.com/photos/3943724/pexels-photo-3943724.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "https://images.pexels.com/photos/4386431/pexels-photo-4386431.jpeg?auto=compress&cs=tinysrgb&w=1200",
    // "https://images.pexels.com/photos/4386370/pexels-photo-4386370.jpeg?auto=compress&cs=tinysrgb&w=1200",
    // "https://images.pexels.com/photos/4386379/pexels-photo-4386379.jpeg?auto=compress&cs=tinysrgb&w=1200"

    //pretty pretty pretty
    // "https://images.pexels.com/photos/4386379/pexels-photo-4386379.jpeg",
    // "https://images.pexels.com/photos/5378706/pexels-photo-5378706.jpeg",
    "https://images.pexels.com/photos/572897/pexels-photo-572897.jpeg",
    "https://images.pexels.com/photos/1486974/pexels-photo-1486974.jpeg",
    "https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg",

    //CYBER|BLUE|TECH AESTHETICS
    // "https://images.pexels.com/photos/15286/pexels-photo.jpg",
    // "https://images.pexels.com/photos/838644/pexels-photo-838644.jpeg",
    // "https://images.pexels.com/photos/1591060/pexels-photo-1591060.jpeg"

    //DREAMY BOKAH
    // "https://images.pexels.com/photos/255379/pexels-photo-255379.jpeg",
    // "https://images.pexels.com/photos/2559941/pexels-photo-2559941.jpeg",
    // "https://images.pexels.com/photos/326093/pexels-photo-326093.jpeg",
    // "https://images.pexels.com/photos/167699/pexels-photo-167699.jpeg"

    //rEADY-TO-GO(ALWAYS WORK)
    // "https://images.pexels.com/photos/4386379/pexels-photo-4386379.jpeg",
    // "https://images.pexels.com/photos/5378706/pexels-photo-5378706.jpeg",
    // "https://images.pexels.com/photos/572897/pexels-photo-572897.jpeg",
    // "https://images.pexels.com/photos/1486974/pexels-photo-1486974.jpeg",
    // "https://images.pexels.com/photos/255379/pexels-photo-255379.jpeg",
    // "https://images.pexels.com/photos/776656/pexels-photo-776656.jpeg"

    //feminine pink
    // "https://images.pexels.com/photos/3688334/pexels-photo-3688334.jpeg",  
    "https://images.pexels.com/photos/1051075/pexels-photo-1051075.jpeg",   //wow
    // "https://images.pexels.com/photos/1779487/pexels-photo-1779487.jpeg",
    "https://images.pexels.com/photos/1287145/pexels-photo-1287145.jpeg"    //wow


];



function getImageForIndex(i) {
    return wishlistImages[i % wishlistImages.length];
}


function createWishlistCard(item, index) {
    const progress = Math.min(
        (item.saved_amount / item.target_amount) * 100,
        100
    );

    // assign unique image
    const img = getImageForIndex(index);

    const card = document.createElement("div");
    card.classList.add("wishlist-card");

    card.innerHTML = `
        <div class="wishlist-card-bg" 
             style="background-image: url('${img}'); background-size: cover; background-position: center; background-repeat: no-repeat;">
        </div>

        <div class="wishlist-card-content">
            <h4 class="wishlist-title">${item.item_name}</h4>
            <p class="wishlist-amount">${formatCurrency(item.saved_amount)}</p>

            <div class="wishlist-progress-bar">
                <div class="wishlist-progress-fill"
                     style="width: ${progress}%"></div>
            </div>
        </div>
    `;

    return card;
}


// ---------------------------
// RENDER ALL CARDS
// ---------------------------


async function renderWishlist() {
    const wishlistContainer = document.querySelector(".wishlist-container");
    wishlistContainer.innerHTML = "";

    const wishlistItems = await fetchWishlist();

    wishlistItems.forEach((item, index) => {
        const card = createWishlistCard(item, index);
        wishlistContainer.appendChild(card);
    });

}



// ---------------------------
// INITIALIZE
// ---------------------------

document.addEventListener("DOMContentLoaded", () => {
  navbarOptionsHighlight(); 
  renderWishlist();
}); 





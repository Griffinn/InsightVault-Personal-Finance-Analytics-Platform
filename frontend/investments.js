
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


document.addEventListener("DOMContentLoaded", () => {
  navbarOptionsHighlight(); 
}); 





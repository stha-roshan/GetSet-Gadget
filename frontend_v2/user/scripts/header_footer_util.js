const logoUrl =
  "https://res.cloudinary.com/doriurxyu/image/upload/v1768020070/tcbkloltura2efoeg6pp.png";
const logoImg = document.querySelector(".logo img");

logoImg.style.opacity = "0";
logoImg.onload = () => {
  logoImg.style.transition = "opacity 0.5s ease";
  logoImg.style.opacity = "1";
};
logoImg.src = logoUrl;
logoImg.alt = "Getset Gadgets";

function getTokenFromCookie() {
    return localStorage.getItem("accessToken");
}

// ============================================
// USER DROPDOWN LOGIC (Dynamic)
// ============================================
const dropdownMenu = document.querySelector(".dropdown-menu");

// Clear existing items just in case
dropdownMenu.innerHTML = "";

const token = getTokenFromCookie();

if (token) {
  // --- SCENARIO 1: USER IS LOGGED IN ---
  
  // 1. My Account Button
  const accountBtn = document.createElement("a");
  accountBtn.href = "/profile"; // Adjust this URL if your profile page is different
  accountBtn.className = "dropdown-item";
  accountBtn.textContent = "Profile  Settings";

  // 2. Logout Button
  const logoutBtn = document.createElement("a");
  logoutBtn.href = "#";
  logoutBtn.className = "dropdown-item";
  logoutBtn.textContent = "Logout";
  
  // Logout Logic
  logoutBtn.addEventListener("click", (e) => {
    e.preventDefault();
    localStorage.removeItem("accessToken"); // Remove token
    // Optional: Remove other user data if stored
    // localStorage.removeItem("user"); 
    setInterval(() => {
      window.location.href = "/login"; // Redirect to login or home
    }, 1000);
  });

  dropdownMenu.appendChild(accountBtn);
  dropdownMenu.appendChild(logoutBtn);

} else {
  // --- SCENARIO 2: USER IS NOT LOGGED IN (Original Logic) ---

  // 1. Login Button
  const loginBtn = document.createElement("a");
  loginBtn.href = "/login";
  loginBtn.className = "dropdown-item";
  loginBtn.textContent = "Login";

  // 2. Register Button
  const registerBtn = document.createElement("a");
  registerBtn.href = "/signup";
  registerBtn.className = "dropdown-item";
  registerBtn.textContent = "Register";

  dropdownMenu.appendChild(loginBtn);
  dropdownMenu.appendChild(registerBtn);
}

// Event Listeners for Toggling (Kept the same)
document.addEventListener("DOMContentLoaded", () => {
  const userIcon = document.getElementById("userIcon");
  const userDropdown = document.getElementById("userDropdown");

  if (userIcon && userDropdown) {
    userIcon.addEventListener("click", (e) => {
      e.stopPropagation();
      userDropdown.classList.toggle("active");
    });

    document.addEventListener("click", (e) => {
      if (!userDropdown.contains(e.target) && e.target !== userIcon) {
        userDropdown.classList.remove("active");
      }
    });
  }
});
// ============================================
// SEARCH SUGGESTIONS
// ============================================
const searchInput = document.getElementById("searchInput");
const suggestionsContainer = document.getElementById("suggestionsContainer");
let searchTimeout;

searchInput.addEventListener("input", async (e) => {
  const searchTerm = e.target.value.trim();

  if (searchTerm.length < 2) {
    hideSuggestions();
    return;
  }

  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(async () => {
    await fetchSuggestions(searchTerm);
  }, 300);
});

async function fetchSuggestions(searchTerm) {
  suggestionsContainer.innerHTML = `
    <div class="loading-message">
      <i class="bx bx-loader-alt"></i> Searching...
    </div>
  `;
  suggestionsContainer.style.display = "block";

  const params = new URLSearchParams({
    q: searchTerm,
    limit: 8,
  });

  try {
    const response = await fetch(`/api/product/search?${params}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    const suggestions = result.data || result;

    // console.log("Suggestions:", suggestions);

    displaySuggestions(suggestions);
  } catch (error) {
    console.error("Search error:", error);
    displayError("Failed to load suggestions. Please try again.");
  }
}

function displaySuggestions(suggestions) {
  if (!suggestions || suggestions.length === 0) {
    suggestionsContainer.innerHTML = `
      <div class="no-results">
        <i class="bx bx-search-alt"></i>
        <p>No products found</p>
      </div>
    `;
    suggestionsContainer.style.display = "block";
    return;
  }

  suggestionsContainer.innerHTML = suggestions
    .map(
      (product) => `
    <div class="suggestion-item" onclick="window.location.href='/product-detail?id=${product._id}'">
      <img src="${product.image}" alt="${product.name}">
      <div class="suggestion-info">
        <div class="suggestion-name">${product.name}</div>
        <div class="suggestion-category">${product.category.name || "Uncategorized"}</div>
      </div>
      <div class="suggestion-price">रु${product.price.toFixed(2)}</div>
    </div>
  `
    )
    .join("");

  suggestionsContainer.style.display = "block";
}

function hideSuggestions() {
  suggestionsContainer.style.display = "none";
  suggestionsContainer.innerHTML = "";
}

function displayError(message) {
  suggestionsContainer.innerHTML = `
    <div class="error-message">
      <i class="bx bx-error"></i> ${message}
    </div>
  `;
  suggestionsContainer.style.display = "block";
}

document.addEventListener("click", (e) => {
  const searchWrapper = document.querySelector(".search-wrapper");

  if (!searchWrapper.contains(e.target)) {
    hideSuggestions();
  }
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    hideSuggestions();
  }
});

async function updateCartBadge() {
    try {
        const token = getTokenFromCookie();
        if (!token) return;

        const response = await fetch(`http://localhost:3000/api/cart`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        const result = await response.json();

        if (result.success && result.data && result.data.items) {
            const totalItems = result.data.items.reduce(
                (sum, item) => sum + item.quantity,
                0
            );
            const cartBadge = document.querySelector(".cart .badge");
            if (cartBadge) {
                cartBadge.textContent = totalItems;
            }
        }
    } catch (error) {
        console.error("Error updating cart badge:", error);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    updateCartBadge();
});
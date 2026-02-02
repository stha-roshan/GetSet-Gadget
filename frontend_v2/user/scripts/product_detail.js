console.log("Product Detail Script Loaded");

const API_BASE_URL = "http://localhost:3000/api";
let currentProductDetails = {};

function getProductIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("id");
}

// Get token from localStorage
function getTokenFromCookie() {
    return localStorage.getItem("accessToken");
}

// Show toast notification
function showToast(message, type = "success") {
    const container = document.getElementById("toast-container");
    
    if (!container) {
        console.error("Toast container not found");
        return;
    }

    const toast = document.createElement("div");
    toast.className = `toast ${type}`;

    let icon = "bx-check-circle";
    if (type === "error") icon = "bx-error-circle";
    if (type === "warning") icon = "bx-error";

    toast.innerHTML = `
        <i class="bx ${icon}"></i>
        <span>${message}</span>
    `;

    container.appendChild(toast);

    // Auto remove after 3.5 seconds with animation
    setTimeout(() => {
        toast.classList.add("removing");
        setTimeout(() => {
            toast.remove();
        }, 300); // Match the animation duration
    }, 3500);
}

async function fetchProductById(productId) {
    try {
        const response = await fetch(`${API_BASE_URL}/product/${productId}`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.success && result.data) {
            console.log("Fetched product data:", result.data);
            return result.data;
        } else {
            throw new Error(result.message || "Failed to fetch product");
        }
    } catch (error) {
        console.error("Error fetching product:", error);
        throw error;
    }
}

async function fetchSimilarProducts(categoryId, currentProductId) {
    try {
        const response = await fetch(`${API_BASE_URL}/product?category=${categoryId}&limit=3`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.success && result.data) {
            // Filter out the current product and limit to 3
            const similarProducts = result.data
                .filter(product => product._id !== currentProductId)
                .slice(0, 3);
            
            console.log("Fetched similar products:", similarProducts);
            return similarProducts;
        } else {
            throw new Error(result.message || "Failed to fetch similar products");
        }
    } catch (error) {
        console.error("Error fetching similar products:", error);
        return [];
    }
}

function displayProductDetails(product) {
    // Update product image
    const productImage = document.querySelector(".product-gallery .main-image img");
    productImage.src = product.image;
    productImage.alt = product.name;

    // Update product title
    const productTitle = document.querySelector(".product-title");
    productTitle.textContent = product.name;

    // Update price
    const currentPrice = document.querySelector(".current-price");
    currentPrice.textContent = `रु${product.price.toFixed(2)}`;

    // Update availability
    const availabilitySpan = document.querySelector(".product-availability span");
    const availabilityContainer = document.querySelector(".product-availability");
    
    // Remove existing icon if any
    const existingIcon = availabilityContainer.querySelector("i");
    if (existingIcon) {
        existingIcon.remove();
    }

    if (product.stock === 0) {
        const errorIcon = document.createElement("i");
        errorIcon.className = "bx bx-error-circle";
        availabilityContainer.prepend(errorIcon);
        availabilitySpan.innerHTML = "Out of Stock";
        availabilitySpan.parentElement.style.color = "#dc2626";
        // Disable add to cart button if out of stock
        document.querySelector(".add-to-cart").disabled = true;
        document.querySelector(".buy-now").disabled = true;
    } else if (product.stock < 10) {
        const warningIcon = document.createElement("i");
        warningIcon.className = "bx bx-error";
        availabilityContainer.prepend(warningIcon);
        availabilitySpan.innerHTML = `Low Stock (${product.stock} units left)`;
        availabilitySpan.parentElement.style.color = "#f59e0b";
        console.log("Low stock warning displayed");
    } else {
        const checkIcon = document.createElement("i");
        checkIcon.className = "bx bx-check-circle";
        availabilityContainer.prepend(checkIcon);
        availabilitySpan.innerHTML = `In Stock (${product.stock} units available)`;
        availabilitySpan.parentElement.style.color = "#10b981";
    }

    // Update description
    const description = document.querySelector(".product-description p");
    description.textContent = product.description;

    // Update quantity input max value
    const quantityInput = document.getElementById("quantityInput");
    quantityInput.max = product.stock;

    // Update category
    const categoryValue = document.querySelector(".product-meta .meta-item:nth-child(1) .meta-value");
    categoryValue.textContent = product.category.name || "N/A";

    // Update brand
    const brandValue = document.querySelector(".product-meta .meta-item:nth-child(2) .meta-value");
    brandValue.textContent = product.brand.name || "N/A";

    console.log("Product details displayed successfully");
}

function displaySimilarProducts(products) {
    const similarProductsGrid = document.querySelector(".similar-products-grid");
    
    // Clear existing content
    similarProductsGrid.innerHTML = "";

    if (products.length === 0) {
        similarProductsGrid.innerHTML = '<p style="text-align: center; color: #6b7280; grid-column: 1/-1;">No similar products found</p>';
        return;
    }

    products.forEach(product => {
        const productCard = document.createElement("div");
        productCard.className = "product-card";
        
        productCard.innerHTML = `
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}">
            </div>
            <div class="product-card-info">
                <h3 class="product-card-title">${product.name}</h3>
                <div class="product-card-meta">
                    <span class="category">${product.category || "N/A"}</span>
                </div>
                <div class="product-card-price">
                    <span class="price">रु${product.price.toFixed(2)}</span>
                </div>
                <button class="view-details-btn" data-product-id="${product._id}">View Details</button>
            </div>
        `;

        similarProductsGrid.appendChild(productCard);
    });

    // Add click event listeners to all "View Details" buttons
    const viewDetailsBtns = document.querySelectorAll(".view-details-btn");
    viewDetailsBtns.forEach(btn => {
        btn.addEventListener("click", function() {
            const productId = this.getAttribute("data-product-id");
            window.location.href = `/product-detail?id=${productId}`;
        });
    });

    console.log("Similar products displayed successfully");
}

async function initProductDetailPage() {
    const productId = getProductIdFromUrl();

    if (!productId) {
        console.error("No product ID found in URL");
        showToast("Product not found!", "error");
        setTimeout(() => {
            window.location.href = "/products";
        }, 2000);
        return;
    }

    try {
        // Fetch and display product details
        currentProductDetails = await fetchProductById(productId);
        displayProductDetails(currentProductDetails);

        // Fetch and display similar products
        const similarProducts = await fetchSimilarProducts(currentProductDetails.category, productId);
        displaySimilarProducts(similarProducts);

    } catch (error) {
        console.error("Error initializing product detail page:", error);
        showToast("Failed to load product details. Please try again.", "error");
    }
}


// Add to Cart function
async function addToCart() {
    const quantity = parseInt(document.getElementById("quantityInput").value);
    const product = currentProductDetails;

    try {
        // Get token from localStorage
        const token = getTokenFromCookie();

        if (!token) {
            showToast("Please login to add items to cart", "warning");
            setTimeout(() => {
                window.location.href = "/login";
            }, 1000);
            return;
        }

        // Get the button
        const addToCartBtn = document.querySelector(".add-to-cart");
        const originalHTML = addToCartBtn.innerHTML;

        // Show loading state
        addToCartBtn.disabled = true;
        addToCartBtn.innerHTML = '<i class="bx bx-loader-alt bx-spin"></i> Adding...';

        // Send request to backend
        const response = await fetch(`${API_BASE_URL}/cart/add`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                productId: product._id,
                quantity: quantity,
            }),
        });

        const result = await response.json();

        // Restore button
        addToCartBtn.disabled = false;
        addToCartBtn.innerHTML = originalHTML;

        if (response.ok && result.success) {
            showToast(`Added ${quantity} × ${product.name} to cart`, "success");
            setTimeout(() => {
                window.location.reload();
            }, 1000);
            // updateCartBadge();
            // console.log("Added to cart:", result.data);
        } else {
            throw new Error(result.message || "Failed to add to cart");
        }
    } catch (error) {
        console.error("Error adding to cart:", error);
        showToast(`Failed to add to cart: ${error.message}`, "error");

        // Restore button state
        const addToCartBtn = document.querySelector(".add-to-cart");
        addToCartBtn.disabled = false;
        addToCartBtn.innerHTML = '<i class="bx bx-cart"></i> Add to Cart';
    }
}

// Buy Now function
function buyNow() {
    const quantity = parseInt(document.getElementById("quantityInput").value);
    const product = currentProductDetails;

    // Check if user is logged in
    const token = getTokenFromCookie();
    if (!token) {
        showToast("Please login to proceed to checkout", "warning");
        setTimeout(() => {
            window.location.href = "/login";
        }, 1000);
        return;
    }

    // Redirect to checkout page with product ID and quantity as query parameters
    window.location.href = `/checkout?id=${product._id}&quantity=${quantity}`;
}

// Add to Cart functionality
document.addEventListener("DOMContentLoaded", function() {
    // Initialize the page
    initProductDetailPage();

    // Load cart badge count on page load
    updateCartBadge();

    // Quantity Selector functionality
    const decreaseBtn = document.getElementById("decreaseQty");
    const increaseBtn = document.getElementById("increaseQty");
    const quantityInput = document.getElementById("quantityInput");

    if (decreaseBtn && increaseBtn && quantityInput) {
        decreaseBtn.addEventListener("click", () => {
            let value = parseInt(quantityInput.value);
            if (value > 1) {
                quantityInput.value = value - 1;
            }
        });

        increaseBtn.addEventListener("click", () => {
            let value = parseInt(quantityInput.value);
            let max = parseInt(quantityInput.max);
            if (value < max) {
                quantityInput.value = value + 1;
            }
        });
    }

    // Add to Cart button
    const addToCartBtn = document.querySelector(".add-to-cart");
    if (addToCartBtn) {
        addToCartBtn.addEventListener("click", addToCart);
    }

    // Buy Now button
    const buyNowBtn = document.querySelector(".buy-now");
    if (buyNowBtn) {
        buyNowBtn.addEventListener("click", buyNow);
    }
});
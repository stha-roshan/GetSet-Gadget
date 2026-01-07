// API Configuration
const API_BASE_URL = "http://localhost:3000/api";

// Fetch products from backend
async function fetchProducts() {
  try {
    const response = await fetch(`${API_BASE_URL}/product/fetchAll`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (result.success && result.data) {
      return result.data;
    } else {
      throw new Error(result.message || "Failed to fetch products");
    }
  } catch (error) {
    console.error("Error fetching products:", error);
    showError(error.message);
    return [];
  }
}

// Show error message
function showError(message) {
  const grid = document.getElementById("productContainer");
  grid.innerHTML = `
    <div class="error-message">
      <i class="bxr bx-error-circle" style="font-size: 48px; color: #e30613;"></i>
      <h3>Unable to Load Products</h3>
      <p>${message}</p>
      <button class="btn-retry" onclick="loadProducts()">
        <i class="bxr bx-refresh"></i> Retry
      </button>
    </div>
  `;
}

// Render products to the page
function renderProducts(products) {
  const grid = document.getElementById("productContainer");

  // Clear container
  grid.innerHTML = "";

  // If no products found
  if (products.length === 0) {
    grid.innerHTML = `
      <div class="no-products">
        <i class="bxr bx-package" style="font-size: 64px; color: #999;"></i>
        <h3>No Products Found</h3>
        <p>There are no products available at the moment.</p>
      </div>
    `;
    return;
  }

  products.forEach((product) => {
    const card = document.createElement("div");
    card.className = "product-card";
    card.dataset.id = product._id; // Store product ID in data attribute

    // Extract brand and category names (handle both object and string formats)
    const brandName = typeof product.brand === 'object' && product.brand !== null 
      ? product.brand.name 
      : product.brand || 'Unknown Brand';
    
    const categoryName = typeof product.category === 'object' && product.category !== null 
      ? product.category.name 
      : product.category || 'Unknown Category';

    // Determine stock badge
    const stockBadge =
      product.stock < 10
        ? `<span class="stock-badge low-stock">Only ${product.stock} left</span>`
        : product.stock < 20
        ? `<span class="stock-badge low-stock">Low Stock</span>`
        : `<span class="stock-badge">In Stock</span>`;

    card.innerHTML = `
      <div class="product-image ${product.image ? '' : 'placeholder'}">
        <img 
          src="${product.image || 'https://via.placeholder.com/300x200/f5f5f5/666666?text=No+Image'}" 
          alt="${product.name}"
          onerror="this.src='https://via.placeholder.com/300x200/f5f5f5/666666?text=Image+Not+Found'"
        />
        ${stockBadge}
      </div>
      <div class="product-info">
        <div class="product-name">
          ${product.name}
        </div>
        <div class="product-description">
          ${product.description}
        </div>

        <div class="product-details">
          <div class="detail-item">
            <span class="detail-label">Price</span>
            <span class="price">
              ₹${product.price.toLocaleString('en-IN')}
            </span>
          </div>

          <div class="detail-item">
            <span class="detail-label">Brand</span>
            <span class="badge-brand">
              ${brandName}
            </span>
          </div>

          <div class="detail-item">
            <span class="detail-label">Category</span>
            <span class="badge-category">
              ${categoryName}
            </span>
          </div>
        </div>
        
        <div class="product-actions">
          <button class="btn-small" onclick="viewProduct('${product._id}')">
            <i class="bxr bx-show"></i> View Details
          </button>
        </div>
      </div>  
    `;
    
    // Add click event listener to log dataset.id when card is clicked
    card.addEventListener('click', function(e) {
      // Don't trigger if clicking the button
      if (!e.target.closest('.btn-small')) {
        console.log('Product card clicked! ID:', this.dataset.id);
      }
    });
    
    grid.appendChild(card);
  });
}

// View product details
function viewProduct(id) {
  console.log("View Details button clicked! Product ID:", id);
  // Navigate to product detail page or open modal
  window.location.href = `/product-detail?id=${id}`;
}

// Main function to load products
async function loadProducts() {
  const products = await fetchProducts();
  renderProducts(products);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  loadProducts();
});

// Optional: Add search functionality
const searchBar = document.querySelector('.search-bar');
if (searchBar) {
  let allProducts = [];
  
  // Store all products for filtering
  fetchProducts().then(products => {
    allProducts = products;
  });

  searchBar.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase().trim();
    
    if (searchTerm === '') {
      renderProducts(allProducts);
    } else {
      const filtered = allProducts.filter(product => {
        const brandName = typeof product.brand === 'object' ? product.brand.name : product.brand;
        const categoryName = typeof product.category === 'object' ? product.category.name : product.category;
        
        return product.name.toLowerCase().includes(searchTerm) ||
               product.description.toLowerCase().includes(searchTerm) ||
               brandName.toLowerCase().includes(searchTerm) ||
               categoryName.toLowerCase().includes(searchTerm);
      });
      renderProducts(filtered);
    }
  });
}
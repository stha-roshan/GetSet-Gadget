const API_BASE_URL = "http://localhost:3000/api";

// Global storage for all products (for filtering)
let allProducts = [];
let allCategories = [];
let allBrands = [];

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
    throw error;
  }
}

async function fetchCategoryList() {
  try {
    const response = await fetch(`${API_BASE_URL}/categories/category-list`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result = await response.json();
    if (result.success && result.data) {
      return result.data;
    } else {
      throw new Error(result.message || "Failed to fetch categories list");
    }
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }
}

async function fetchBrandList() {
  try {
    const response = await fetch(`${API_BASE_URL}/brands/brand-list`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result = await response.json();
    if (result.success && result.data) {
      return result.data;
    } else {
      throw new Error(result.message || "Failed to fetch brand list");
    }
  } catch (error) {
    console.error("Error fetching brands:", error);
    throw error;
  }
}

function showError(message) {
  const grid = document.getElementById("productContainer");
  grid.innerHTML = `
    <div class="error-message">
      <i class="bx bx-error-circle" style="font-size: 48px; color: #e30613;"></i>
      <h3>Unable to Load Products</h3>
      <p>${message}</p>
    </div>
  `;
}

function renderProducts(products) {
  const grid = document.getElementById("productContainer");

  grid.innerHTML = "";

  if (products.length === 0) {
    grid.innerHTML = `
      <div class="no-products">
        <i class="bx bx-package" style="font-size: 64px; color: #999;"></i>
        <h3>No Products Found</h3>
        <p>Try adjusting your filters to see more products.</p>
      </div>
    `;
    return;
  }

  products.forEach((product) => {
    const productCard = document.createElement("div");
    productCard.className = "product-card";
    productCard.addEventListener("click", () => {
      window.location.href = `/product-detail?id=${product._id}`;
    });

    const productImage = document.createElement("div");
    productImage.className = "product-image";
    productImage.innerHTML = `<img src="${product.image}" alt="${product.name}">`;

    const productInfo = document.createElement("div");
    productInfo.className = "product-info";
    productInfo.innerHTML = `
            <div class="badge-category">${product.category.name}</div>
            <h4 class="product-name">${product.name}</h4>
            <div class="price-row">
                <span class="price">रु${product.price}</span>
                <button class="btn-view-details" title="View detail" onclick="window.location.href='/product-detail?id=${product._id}'">
                    <i class="bx bx-right-arrow-alt"></i>
                </button>
            </div>
            `;
    productCard.appendChild(productImage);
    productCard.appendChild(productInfo);
    grid.appendChild(productCard);
  });
}

function showProductCount(count) {
  const countElement = document.getElementById("countElement");
  countElement.textContent = count;
}

function renderCategoryList(categories) {
  const categoryFilter = document.getElementById("categoryFilter");
  categoryFilter.innerHTML = ""; // Clear existing
  categoryFilter.innerHTML = `<h3>Categories</h3>`;

  categories.forEach((category) => {
    const label = document.createElement("label");
    label.className = "filter-item";
    label.innerHTML = `
      <input type="checkbox" class="category-checkbox" value="${category._id}" />
      ${category.name}
    `;
    categoryFilter.appendChild(label);
  });

  // Add event listeners to all category checkboxes
  const checkboxes = categoryFilter.querySelectorAll('.category-checkbox');
  checkboxes.forEach(checkbox => {
    checkbox.addEventListener('change', handleFilterChange);
  });
}

function renderBrandList(brands) {
  const brandFilter = document.getElementById("brandFilter");
  brandFilter.innerHTML = ""; // Clear existing
  brandFilter.innerHTML = `<h3>Brands</h3>`;

  brands.forEach((brand) => {
    const label = document.createElement("label");
    label.className = "filter-item";
    label.innerHTML = `
      <input type="checkbox" class="brand-checkbox" value="${brand._id}" />
      ${brand.name}
    `;
    brandFilter.appendChild(label);
  });

  // Add event listeners to all brand checkboxes
  const checkboxes = brandFilter.querySelectorAll('.brand-checkbox');
  checkboxes.forEach(checkbox => {
    checkbox.addEventListener('change', handleFilterChange);
  });
}

// ============= FILTERING LOGIC =============

function getSelectedCategories() {
  const checkboxes = document.querySelectorAll('.category-checkbox:checked');
  return Array.from(checkboxes).map(cb => cb.value);
}

function getSelectedBrands() {
  const checkboxes = document.querySelectorAll('.brand-checkbox:checked');
  return Array.from(checkboxes).map(cb => cb.value);
}

function filterProducts() {
  const selectedCategories = getSelectedCategories();
  const selectedBrands = getSelectedBrands();

  let filteredProducts = allProducts;

  // Filter by category
  if (selectedCategories.length > 0) {
    filteredProducts = filteredProducts.filter(product => {
      // product.category could be an object with _id or a string
      const categoryId = typeof product.category === 'object'
        ? product.category._id
        : product.category;
      return selectedCategories.includes(categoryId);
    });
  }

  // Filter by brand
  if (selectedBrands.length > 0) {
    filteredProducts = filteredProducts.filter(product => {
      // product.brand could be an object with _id or a string
      const brandId = typeof product.brand === 'object'
        ? product.brand._id
        : product.brand;
      return selectedBrands.includes(brandId);
    });
  }

  return filteredProducts;
}

function handleFilterChange() {
  const filteredProducts = filterProducts();
  renderProducts(filteredProducts);
  showProductCount(filteredProducts.length);

  // Optional: Show filter summary
  updateFilterSummary();
}

function updateFilterSummary() {
  const selectedCategories = getSelectedCategories();
  const selectedBrands = getSelectedBrands();

  const totalFilters = selectedCategories.length + selectedBrands.length;

  if (totalFilters > 0) {
    // console.log(`Active filters: ${totalFilters} (${selectedCategories.length} categories, ${selectedBrands.length} brands)`);
  }
}

// ============= INITIALIZATION =============

async function loadProducts() {
  try {
    const products = await fetchProducts();
    allProducts = products; // Store globally
    renderProducts(allProducts);
    showProductCount(allProducts.length);
  } catch (error) {
    showError(error.message || "Something went wrong. Please try again later.");
  }
}

async function loadCategories() {
  try {
    const categories = await fetchCategoryList();
    allCategories = categories; // Store globally
    renderCategoryList(categories);
  } catch (error) {
    console.error("Error loading categories:", error);
  }
}

async function loadBrands() {
  try {
    const brands = await fetchBrandList();
    allBrands = brands; // Store globally
    renderBrandList(brands);
  } catch (error) {
    console.error("Error loading brands:", error);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadProducts();
  loadCategories();
  loadBrands();
});
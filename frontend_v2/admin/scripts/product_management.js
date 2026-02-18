document.addEventListener('DOMContentLoaded', () => {
    fetchProducts();
});

async function fetchProducts() {
    const productsGrid = document.getElementById('productsGrid');

    try {
        const response = await fetch('/api/product/fetchAll');
        const result = await response.json();

        if (result.success && result.data.length > 0) {
            productsGrid.innerHTML = result.data.map(product => createProductCard(product)).join('');
        } else {
            productsGrid.innerHTML = '<p class="no-products">No products found.</p>';
        }
    } catch (error) {
        console.error('Error fetching products:', error);
        productsGrid.innerHTML = '<p class="error">Failed to load products.</p>';
    }
}

function createProductCard(product) {
    let badgeClass = 'badge-stock';
    let stockStatus = 'In Stock';

    if (product.stock === 0) {
        badgeClass = 'badge-out';
        stockStatus = 'Out of Stock';
    } else if (product.stock < 10) {
        badgeClass = 'badge-low';
        stockStatus = 'Low Stock';
    }

    return `
        <div class="product-card" data-id="${product._id}">
            <div class="product-image">
                <img src="${product.image || 'https://via.placeholder.com/400x300'}" alt="${product.name}">
                <span class="product-badge ${badgeClass}">${stockStatus}</span>
            </div>
            <div class="product-info">
                <div class="product-category">${product.category?.name || 'Uncategorized'}</div>
                <h3 class="product-name">${product.name}</h3>
                <div class="product-details">
                    <div class="product-price">Rs. ${product.price.toLocaleString('en-IN')}</div>
                    <div class="product-stock">
                        <i class='bx bx-package'></i>
                        <span>${product.stock} Units</span>
                    </div>
                </div>
                <div class="product-actions">
                    <button class="action-btn" onclick="editProduct('${product._id}')">
                        <i class='bx bx-edit'></i>
                        Edit
                    </button>
                    <button class="action-btn delete" onclick="deleteProduct('${product._id}')">
                        <i class='bx bx-trash'></i>
                        Delete
                    </button>
                </div>
            </div>
        </div>
    `;
}

function editProduct(id) {
    console.log("Edit product:", id);
}

function deleteProduct(id) {
    if (confirm("Are you sure you want to delete this product?")) {
        console.log("Delete product:", id);
    }
}
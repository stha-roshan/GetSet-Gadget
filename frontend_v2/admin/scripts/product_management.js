document.addEventListener("DOMContentLoaded", () => {
    fetchProducts();
});

async function fetchProducts() {
    const productsGrid = document.getElementById("productsGrid");

    try {
        const response = await fetch("/api/product/fetchAll");
        const result = await response.json();

        if (result.success && result.data.length > 0) {
            productsGrid.innerHTML = result.data
                .map((product) => createProductCard(product))
                .join("");
        } else {
            productsGrid.innerHTML = '<p class="no-products">No products found.</p>';
        }
    } catch (error) {
        console.error("Error fetching products:", error);
        productsGrid.innerHTML = '<p class="error">Failed to load products.</p>';
    }
}

function createProductCard(product) {
    let badgeClass = "badge-stock";
    let stockStatus = "In Stock";

    if (product.stock === 0) {
        badgeClass = "badge-out";
        stockStatus = "Out of Stock";
    } else if (product.stock < 10) {
        badgeClass = "badge-low";
        stockStatus = "Low Stock";
    }

    return `
        <div class="product-card" data-id="${product._id}">
            <div class="product-image">
                <img src="${product.image || "https://via.placeholder.com/400x300"}" alt="${product.name}">
                <span class="product-badge ${badgeClass}">${stockStatus}</span>
            </div>
            <div class="product-info">
                <div class="product-category">${product.category?.name || "Uncategorized"}</div>
                <h3 class="product-name">${product.name}</h3>
                <div class="product-details">
                    <div class="product-price">Rs. ${product.price.toLocaleString("en-IN")}</div>
                    <div class="product-stock">
                        <i class='bx bx-package'></i>
                        <span>${product.stock} Units</span>
                    </div>
                </div>
            <div class="product-actions">
    <div class="edit-dropdown-wrap">
        <button class="action-btn edit-toggle-btn" onclick="toggleEditDropdown(event, '${product._id}')">
            <i class='bx bx-edit'></i>
            Edit
            <i class='bx bx-chevron-down edit-chevron'></i>
        </button>
        <div class="edit-dropdown" id="edit-dropdown-${product._id}">
            <button onclick="editProductInfo('${product._id}')">
                <i class='bx bx-info-circle'></i>
                Edit Product Info
            </button>
 
        </div>
    </div>
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
    window.location.href = `/admin/edit-product?id=${id}`;
}

async function deleteProduct(id) {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
        const response = await fetch(`/api/product/${id}`, {
            method: 'DELETE',
            credentials: 'include'
        });

        const result = await response.json();

        if (result.success) {
            // Remove card from DOM without full page reload
            const card = document.querySelector(`.product-card[data-id="${id}"]`);
            if (card) {
                card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                card.style.opacity = '0';
                card.style.transform = 'scale(0.95)';
                setTimeout(() => card.remove(), 300);
            }
        } else {
            alert(result.message || 'Failed to delete product.');
        }
    } catch (error) {
        console.error('Error deleting product:', error);
        alert('Something went wrong. Please try again.');
    }
}


function toggleEditDropdown(event, id) {
    event.stopPropagation();
    // Close any other open dropdowns first
    document.querySelectorAll('.edit-dropdown.open').forEach(d => {
        if (d.id !== `edit-dropdown-${id}`) d.classList.remove('open');
    });
    document.getElementById(`edit-dropdown-${id}`).classList.toggle('open');
}

// Close dropdown when clicking outside
document.addEventListener('click', () => {
    document.querySelectorAll('.edit-dropdown.open').forEach(d => d.classList.remove('open'));
});

function editProductInfo(id) {
    window.location.href = `/admin/edit-product?id=${id}`;
}

function editStock(id) {
    console.log('Edit stock for:', id);
    // window.location.href = `/admin/edit-stock?id=${id}`;
}
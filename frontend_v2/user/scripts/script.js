const API_BASE_URL = 'http://localhost:3000/api';

document.addEventListener('DOMContentLoaded', () => {
    fetchBestSellers();
});

async function fetchBestSellers() {
    const grid = document.getElementById('bestSellersGrid');

    try {
        const response = await fetch(`${API_BASE_URL}/product/best-sellers`);
        const result = await response.json();

        if (!result.success || !result.data || result.data.length === 0) {
            grid.innerHTML = '<p style="color:#999;">No best sellers found.</p>';
            return;
        }

        grid.innerHTML = result.data.map(product => createProductCard(product)).join('');

    } catch (err) {
        console.error('Error fetching best sellers:', err);
        grid.innerHTML = '<p style="color:#999;">Failed to load best sellers.</p>';
    }
}

function createProductCard(product) {
    return `
        <div class="product-card" onclick="window.location.href='/product-detail?id=${product._id}'">
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}"
                     onerror="this.src='https://via.placeholder.com/220'"/>
            </div>
            <div class="product-info">
                <div class="badge-category">${product.category?.name || 'Uncategorized'}</div>
                <h4 class="product-name">${product.name}</h4>
                <div class="price-row">
                    <span class="price">Rs. ${product.price.toLocaleString('en-NP')}</span>
                    <button class="btn-view-details" title="View detail"
                        onclick="event.stopPropagation(); window.location.href='/product-detail?id=${product._id}'">
                        <i class="bx bx-right-arrow-alt"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
}
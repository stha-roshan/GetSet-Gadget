const API_BASE_URL = 'http://localhost:3000/api';

let allOrders = [];
let activeFilter = 'all';

// ── INIT ──
document.addEventListener('DOMContentLoaded', () => {
    setupTabs();
    fetchOrders();
});

// ── FETCH ORDERS ──
async function fetchOrders() {
    const list = document.getElementById('ordersList');
    list.innerHTML = `
        <div class="loading-state">
            <i class='bx bx-loader-alt bx-spin'></i>
            <p>Loading your orders...</p>
        </div>`;

    try {
        const response = await fetch(`${API_BASE_URL}/orders/my-orders`, {
            credentials: 'include'   // sends the cookie so verifyUser can read it
        });

        const result = await response.json();

        if (!result.success) {
            showError('Failed to load orders. Please try again.');
            return;
        }

        allOrders = result.data || [];
        renderOrders(allOrders);

    } catch (err) {
        console.error('Error fetching orders:', err);
        showError('Could not connect to server. Please try again.');
    }
}

// ── RENDER ORDERS ──
function renderOrders(orders) {
    const list = document.getElementById('ordersList');

    const filtered = activeFilter === 'all'
        ? orders
        : orders.filter(o => o.status === activeFilter);

    if (filtered.length === 0) {
        list.innerHTML = `
            <div class="empty-state">
                <i class='bx bx-package'></i>
                <h3>${activeFilter === 'all' ? "You haven't placed any orders yet" : `No ${activeFilter} orders`}</h3>
                <p>${activeFilter === 'all' ? 'Start shopping and your orders will appear here.' : 'Try a different filter above.'}</p>
                ${activeFilter === 'all' ? `<a href="/products">Browse Products</a>` : ''}
            </div>`;
        return;
    }

    list.innerHTML = filtered.map((order, i) => createOrderCard(order, i)).join('');
}

// ── CREATE ORDER CARD ──
function createOrderCard(order, index) {
    const date   = formatDate(new Date(order.createdAt));
    const status = order.status || 'pending';
    const total  = `Rs. ${order.totalAmount.toLocaleString('en-NP')}`;
    const items  = order.items || [];

    // Thumbnails — show up to 3, then +N
    const visibleItems = items.slice(0, 3);
    const extraCount   = items.length - visibleItems.length;

    const thumbsHTML = visibleItems.map(item => `
        <img class="item-thumb"
             src="${item.image || ''}"
             alt="${item.name}"
             onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'"/>
        <div class="item-thumb thumb-fallback" style="display:none;">
            <i class='bx bx-package'></i>
        </div>
    `).join('');

    const extraHTML = extraCount > 0
        ? `<div class="extra-items">+${extraCount}</div>`
        : '';

    const firstName = items[0]?.name || 'Order items';
    const moreText  = items.length > 1
        ? `<div class="more-items-text">+${items.length - 1} more item${items.length - 1 > 1 ? 's' : ''}</div>`
        : '';

    return `
    <div class="order-card" style="animation-delay: ${index * 0.06}s">

        <div class="card-topbar">
            <div class="order-meta">
                <span class="order-number">${order.orderNumber}</span>
                <span class="order-date">
                    <i class='bx bx-calendar' style="margin-right:4px;vertical-align:-2px;"></i>${date}
                </span>
            </div>
            <span class="status-badge ${status}">${capitalize(status)}</span>
        </div>

        <div class="card-body">
            <div class="order-items-summary">
                <div class="item-thumbnails">
                    ${thumbsHTML}
                    ${extraHTML}
                </div>
                <div class="items-text">
                    <div class="first-item-name">${firstName}</div>
                    ${moreText}
                </div>
            </div>
            <div class="order-amount">
                <div class="amount-label">Total Paid</div>
                <div class="amount-value">${total}</div>
            </div>
        </div>

        <div class="card-footer">
           <div class="payment-info">
    <i class='bx ${order.payment?.status === "completed" ? "bx-check-circle" : "bx-error-circle"}'
       style="color: ${order.payment?.status === "completed" ? "#22c55e" : "#f59e0b"}"></i>
    ${capitalize(order.payment?.method || 'esewa')} · ${capitalize(order.payment?.status || 'pending')}
</div>
            <div class="card-actions">
                <button class="btn-view" onclick="viewOrder('${order._id}')">
                    <i class='bx bx-show'></i> View Details
                </button>
            </div>
        </div>

    </div>`;
}

// ── TABS ──
function setupTabs() {
    document.getElementById('filterTabs').addEventListener('click', (e) => {
        const tab = e.target.closest('.tab');
        if (!tab) return;

        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        activeFilter = tab.dataset.status;
        renderOrders(allOrders);
    });
}

// ── VIEW ORDER DETAIL ──
function viewOrder(orderId) {
    window.location.href = `/my-orders/${orderId}`;
}

// ── HELPERS ──
function formatDate(date) {
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const d    = date.getDate();
    const mon  = months[date.getMonth()];
    const y    = date.getFullYear();
    let h      = date.getHours();
    const min  = date.getMinutes().toString().padStart(2, '0');
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${mon} ${d}, ${y} · ${h}:${min} ${ampm}`;
}

function capitalize(str) {
    return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
}

function showError(msg) {
    document.getElementById('ordersList').innerHTML = `
        <div class="error-state">
            <i class='bx bx-error-circle'></i>
            <p>${msg}</p>
        </div>`;
}
// Fetch and render completed orders
async function fetchAndRenderOrders() {
    const ordersGrid = document.getElementById('ordersGrid');
    
    try {
        // Show loading state
        ordersGrid.innerHTML = '<div class="loading">Loading orders...</div>';
        
        // Fetch orders from API
        const response = await fetch('http://localhost:3000/api/orders/completed-orders');
        const result = await response.json();
        
        if (!result.success || !result.data || result.data.length === 0) {
            ordersGrid.innerHTML = '<div class="no-orders">No completed orders found</div>';
            return;
        }
        
        // Clear loading state
        ordersGrid.innerHTML = '';
        
        // Render each order
        result.data.forEach(order => {
            const orderCard = createOrderCard(order);
            ordersGrid.appendChild(orderCard);
        });
        
    } catch (error) {
        console.error('Error fetching orders:', error);
        ordersGrid.innerHTML = '<div class="error">Failed to load orders. Please try again.</div>';
    }
}

// Create order card element
function createOrderCard(order) {
    const card = document.createElement('div');
    card.className = 'order-card';
    
    // Format date
    const orderDate = new Date(order.createdAt);
    const formattedDate = formatDate(orderDate);
    
    // Get payment status
    const paymentStatus = order.status;
    // console.log(`order status: ${order.status}`);

    function getOrderStatus(){
        if(order.status === 'pending') return 'pending';
        if(order.status === 'confirmed') return 'confirmed';
        if(order.status === 'shipped') return 'shipped';
        if(order.status === 'delivered') return 'delivered';
        if(order.status === 'cancelled') return 'cancelled';
    }

    const orderStatus = getOrderStatus();
    console.log(`order status: ${orderStatus}`);

    let paymentBadgeClass = '';

    if(orderStatus === 'pending') paymentBadgeClass = 'status-pending';
    else if(orderStatus === 'confirmed') paymentBadgeClass = 'status-confirmed';
    else if(orderStatus === 'shipped') paymentBadgeClass = 'status-shipped';
    else if(orderStatus === 'delivered') paymentBadgeClass = 'status-delivered';
    else if(orderStatus === 'cancelled') paymentBadgeClass = 'status-cancelled';
    // const paymentBadgeClass = orderStatus === 'pending' ? 'status-pending' : 'status-completed';
    
    // Get delivery status
    // const deliveryStatus = order.deliveryStatus.replace('_', ' ');
    
    // Get first item (or show multiple)
    const itemsDisplay = getItemsDisplay(order.items);
    
    // Format total amount
    const totalAmount = formatCurrency(order.totalAmount);
    
    card.innerHTML = `
        <div class="order-header">
            <div class="order-info">
                <span class="order-number">${order.orderNumber}</span>
                <span class="order-date">${formattedDate}</span>
            </div>
            <div class="status-badge ${paymentBadgeClass}">${capitalizeFirst(paymentStatus)}</div>
        </div>

        <div class="order-body">
            <div class="customer-section">
                <p class="label">Customer</p>
                <p class="value">${order.customerName}</p>
                <p class="sub-value">${order.customerEmail}</p>
            </div>

            <div class="items-section">
                <p class="label">Items</p>
                ${itemsDisplay}
            </div>

            <div class="amount-section">
                <p class="label">Total Amount</p>
                <p class="total-price">${totalAmount}</p>
            </div>

            <div class="actions-section">
                <button class="btn-view-details" onclick="viewOrderDetails('${order._id}')">
                    <i class='bx bx-show'></i> View Details
                </button>
            </div>
        </div>
    `;
    
    return card;
}

// Format date to readable string
function formatDate(date) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();
    
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    
    return `${month} ${day}, ${year} • ${hours}:${minutes} ${ampm}`;
}

// Get items display HTML
function getItemsDisplay(items) {
    if (items.length === 0) return '<p class="value">No items</p>';
    
    if (items.length === 1) {
        return `<p class="value">${items[0].name} <span class="qty">x${items[0].quantity}</span></p>`;
    }
    
    // Multiple items - show first one and count
    const firstItem = items[0];
    const remainingCount = items.length - 1;
    
    return `
        <p class="value">${firstItem.name} <span class="qty">x${firstItem.quantity}</span></p>
        <p class="sub-value">+${remainingCount} more item${remainingCount > 1 ? 's' : ''}</p>
    `;
}

// Format currency
function formatCurrency(amount) {
    return `Rs. ${amount.toLocaleString('en-NP')}`;
}

// Capitalize first letter
function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// View order details (placeholder function)
function viewOrderDetails(orderId) {
    console.log('View order details:', orderId);
    window.location.href = `/admin/order-detail?id=${orderId}`;
    // You can implement navigation to order details page here
    // For example: window.location.href = `/admin/order-details/${orderId}`;
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    fetchAndRenderOrders();
});

// Optional: Refresh orders every 30 seconds
// setInterval(fetchAndRenderOrders, 30000);
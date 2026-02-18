// Order Detail Page Script

// Get order ID from URL query parameter
function getOrderIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

// Format date function
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    };
    return date.toLocaleDateString('en-US', options).replace(',', ' •');
}

// Format currency
function formatCurrency(amount) {
    return `Rs. ${amount.toLocaleString()}`;
}

// Get payment method display name
function getPaymentMethodName(method) {
    const methods = {
        'esewa': 'eSewa',
        'khalti': 'Khalti',
        'cash': 'Cash on Delivery',
        'card': 'Card Payment'
    };
    return methods[method] || method.toUpperCase();
}

// Get status class for badges
function getStatusClass(status) {
    const statusStr = String(status).toLowerCase().replace(/ /g, '_');
    return statusStr;
}

// Show notification
function showNotification(message, type = 'success') {
    const notificationId = type === 'success' ? 'successNotification' : 'errorNotification';
    const messageId = type === 'success' ? 'successMessage' : 'errorNotificationMessage';
    
    const notification = document.getElementById(notificationId);
    const messageElement = document.getElementById(messageId);
    
    messageElement.textContent = message;
    notification.style.display = 'flex';
    
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

// Populate order details on the page
function populateOrderDetails(order) {
    // Header
    document.getElementById('orderNumber').textContent = order.orderNumber;
    document.getElementById('orderDate').textContent = formatDate(order.createdAt);
    
    // Header status badge
    const headerBadge = document.getElementById('headerStatusBadge');
    headerBadge.textContent = (order.status || 'pending').replace('_', ' ').toUpperCase();
    headerBadge.className = `status-badge ${getStatusClass(order.status || 'pending')}`;
    
    // Customer Information
    document.getElementById('customerName').textContent = order.customerName || '-';
    document.getElementById('customerEmail').textContent = order.customerEmail || '-';
    document.getElementById('customerPhone').textContent = order.customerPhone || 'Not provided';
    
    // Shipping Address
    const address = order.shippingAddress;
    document.getElementById('shippingAddress').innerHTML = `
        ${address.address}<br>
        ${address.city}, ${address.zipCode}<br>
        ${address.country}
    `;
    
    // Payment Information
    document.getElementById('paymentMethod').textContent = getPaymentMethodName(order.payment.method);
    
    const paymentStatusBadge = document.getElementById('paymentStatus');
    paymentStatusBadge.textContent = order.payment.status.toUpperCase();
    paymentStatusBadge.className = `status-badge-small ${getStatusClass(order.payment.status)}`;
    
    document.getElementById('transactionId').textContent = order.payment.transactionUuid || '-';
    
    const statusBadge = document.getElementById('orderStatus');
    statusBadge.textContent = (order.status || 'pending').replace('_', ' ').toUpperCase();
    statusBadge.className = `status-badge ${getStatusClass(order.status || 'pending')}`;
    
    // Set dropdown to current delivery status
    document.getElementById('statusSelect').value = order.status || 'pending';
    
    // Order Items
    const itemsTableBody = document.getElementById('itemsTableBody');
    itemsTableBody.innerHTML = '';
    
    order.items.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="item-name">${item.name}</td>
            <td class="text-center"><span class="qty-badge">${item.quantity}</span></td>
            <td class="text-right">${formatCurrency(item.price)}</td>
            <td class="text-right" style="font-weight: 600;">${formatCurrency(item.price * item.quantity)}</td>
        `;
        itemsTableBody.appendChild(row);
    });
    
    // Order Summary
    document.getElementById('subtotal').textContent = formatCurrency(order.subtotal);
    document.getElementById('tax').textContent = formatCurrency(order.tax);
    document.getElementById('shippingCost').textContent = formatCurrency(order.shippingCost);
    document.getElementById('totalAmount').textContent = formatCurrency(order.totalAmount);
    
    // Timestamps
    document.getElementById('createdAt').textContent = formatDate(order.createdAt);
    document.getElementById('updatedAt').textContent = formatDate(order.updatedAt);
    
    // Store order data globally for updates
    window.currentOrder = order;
}

// Fetch order details from API
async function fetchOrderDetails(orderId) {
    const loadingState = document.getElementById('loadingState');
    const errorState = document.getElementById('errorState');
    const orderContent = document.getElementById('orderContent');
    
    try {
        // Show loading state
        loadingState.style.display = 'flex';
        errorState.style.display = 'none';
        orderContent.style.display = 'none';
        
        // Make API call to your endpoint
        const response = await fetch(`/api/orders/order-details/${orderId}`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch order details');
        }
        
        const result = await response.json();
        
        // Check if data exists
        if (!result.data) {
            throw new Error('Order not found');
        }
        
        // Hide loading, show content
        loadingState.style.display = 'none';
        orderContent.style.display = 'block';
        
        // Populate the page with order data
        populateOrderDetails(result.data);
        
    } catch (error) {
        console.error('Error fetching order:', error);
        
        // Show error state
        loadingState.style.display = 'none';
        errorState.style.display = 'flex';
        document.getElementById('errorMessage').textContent = error.message || 'Failed to load order details';
    }
}

// Update order status
async function updateOrderStatus(orderId, newStatus) {
    try {
        // Disable button during update
        const updateBtn = document.getElementById('updateStatusBtn');
        updateBtn.disabled = true;
        updateBtn.innerHTML = '<i class="bx bx-loader-alt bx-spin"></i> Updating...';
        
        // Make API call to update status
        const response = await fetch(`/api/orders/${orderId}/status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                status: newStatus
            })
        });
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.message || 'Failed to update order status');
        }
        
        
        // Update UI with new status - both badges
        const orderStatusBadge = document.getElementById('orderStatus');
        orderStatusBadge.textContent = newStatus.replace('_', ' ').toUpperCase();
        orderStatusBadge.className = `status-badge ${getStatusClass(newStatus)}`;
        
        const headerBadge = document.getElementById('headerStatusBadge');
        headerBadge.textContent = newStatus.replace('_', ' ').toUpperCase();
        headerBadge.className = `status-badge ${getStatusClass(newStatus)}`;
        
        // Update timestamp
        const now = new Date().toISOString();
        document.getElementById('updatedAt').textContent = formatDate(now);
        
        // Update global order object
        if (window.currentOrder) {
            window.currentOrder.deliveryStatus = newStatus;
            window.currentOrder.updatedAt = now;
        }
        
        // Show success notification
        showNotification( result.message || 'Order status updated successfully!', 'success');
        
        // Re-enable button
        updateBtn.disabled = false;
        updateBtn.innerHTML = '<i class="bx bx-refresh"></i> Update Status';
        
    } catch (error) {
        console.error('Error updating status:', error);
        showNotification(error.message || 'Failed to update order status', 'error');
        
        // Re-enable button
        const updateBtn = document.getElementById('updateStatusBtn');
        updateBtn.disabled = false;
        updateBtn.innerHTML = '<i class="bx bx-refresh"></i> Update Status';
    }
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    const orderId = getOrderIdFromURL();
    
    if (!orderId) {
        document.getElementById('loadingState').style.display = 'none';
        document.getElementById('errorState').style.display = 'flex';
        document.getElementById('errorMessage').textContent = 'No order ID provided';
        return;
    }
    
    // Fetch order details
    fetchOrderDetails(orderId);
    
    // Update status button event listener
    document.getElementById('updateStatusBtn').addEventListener('click', () => {
        const newStatus = document.getElementById('statusSelect').value;
        const orderId = getOrderIdFromURL();
        
        if (window.currentOrder && newStatus !== window.currentOrder.deliveryStatus) {
            updateOrderStatus(orderId, newStatus);
        } else if (newStatus === window.currentOrder?.deliveryStatus) {
            showNotification('Status is already set to ' + newStatus.replace('_', ' ').toUpperCase(), 'error');
        }
    });
});
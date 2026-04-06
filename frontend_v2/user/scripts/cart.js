const API_BASE_URL = "/api/cart";

let currentCartItems = [];

async function fetchCart() {
  const token = localStorage.getItem("accessToken");
  try {
    const response = await fetch(`${API_BASE_URL}/`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();
    console.log("Cart Data:", result);

    if (result.success && result.data.items.length > 0) {
      currentCartItems = result.data.items;
      renderCart(result.data.items);
    } else {
      document.getElementById("cart-container").style.display = "none";
      document.getElementById("empty-cart-msg").style.display = "block";
    }
  } catch (error) {
    console.error("Fetch Error:", error);
  }
}

function renderCart(items) {
  const listContainer = document.getElementById("cart-items-list");
  listContainer.innerHTML = "";
  let grandTotal = 0;

  items.forEach((item) => {
    const product = item.productId;
    const lineTotal = product.price * item.quantity;
    grandTotal += lineTotal;

    const itemHtml = `
      <div class="cart-item">
        <div class="product-info">
          <img src="${product.image}" alt="${product.name}">
          <div class="product-details">
            <h4>${product.name}</h4>
          </div>
        </div>
        <div class="price-text">रु${product.price}</div>
        <div class="qty-controls">
          <button class="qty-btn" onclick="updateQty('${product._id}', ${item.quantity - 1})">-</button>
          <span class="qty-val">${item.quantity}</span>
          <button class="qty-btn" onclick="updateQty('${product._id}', ${item.quantity + 1})">+</button>
        </div>
        <div class="subtotal-text">रु${lineTotal}</div>
        <div>
          <i class='bx bx-trash remove-icon' onclick="removeItem('${product._id}')"></i>
        </div>
      </div>
    `;
    listContainer.innerHTML += itemHtml;
  });

  document.getElementById("summary-subtotal").innerText = `रु${grandTotal}`;
  document.getElementById("summary-total").innerText = `रु${grandTotal}`;
}

async function updateQty(productId, newQty) {
  if (newQty < 1) return;
  const token = localStorage.getItem("accessToken");
  const response = await fetch(`${API_BASE_URL}/update`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ productId, quantity: newQty }),
  });
  if (response.ok) fetchCart();
}

async function removeItem(productId) {
  const token = localStorage.getItem("accessToken");
  const response = await fetch(`${API_BASE_URL}/remove/${productId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (response.ok) fetchCart();
}

function proceedToCheckout() {
  if (currentCartItems.length === 0) {
    alert("Your cart is empty!");
    return;
  }

  const items = currentCartItems.map((item) => {
    const product = item.productId;
    return {
      productId: product._id,
      name: product.name,
      image: product.image,
      price: product.price,
      description: product.description || "",
      quantity: item.quantity,
    };
  });

  sessionStorage.setItem(
    "checkoutData",
    JSON.stringify({ source: "cart", items })
  );

  window.location.href = "/checkout";
}

document.addEventListener("DOMContentLoaded", () => {
  fetchCart();
  document.querySelector(".checkout-btn").addEventListener("click", proceedToCheckout);
});
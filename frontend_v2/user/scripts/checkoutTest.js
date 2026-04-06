const API_BASE_URL = "http://localhost:3000/api";

// ============ UTILITIES ============
function getToken() {
  return localStorage.getItem("accessToken");
}

function getUrlParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    productId: params.get("id"),
    quantity: parseInt(params.get("quantity")) || 1,
  };
}

// ============ FETCH PRODUCT (Buy Now flow) ============
async function fetchProduct(productId) {
  const res = await fetch(`${API_BASE_URL}/product/${productId}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  const data = await res.json();
  if (data.success) return data.data;
  throw new Error(data.message || "Failed to fetch product");
}

// ============ PRICE CALCULATION ============
function calcPrices(subtotal) {
  const tax = Math.round(subtotal * 0.13);
  const shipping = 0;
  const total = subtotal + tax + shipping;
  return { subtotal, tax, shipping, total };
}

// ============ ORDER SUMMARY: SINGLE PRODUCT (Buy Now) ============
function populateOrderSummary(product, qty) {
  const subtotal = product.price * qty;
  const { tax, shipping, total } = calcPrices(subtotal);

  const container = document.getElementById("product-card");
  container.innerHTML = `
    <div class="product-image">
      <img src="${product.image}" alt="${product.name}" />
      <span class="badge" id="qty-badge">${qty}</span>
    </div>
    <div class="product-details">
      <h4>${product.name}</h4>
      <p class="description">${product.description || ""}</p>
      <p class="price" style="color: var(--text-muted); font-size: 0.85rem; font-weight: 500;">
        रु ${product.price.toLocaleString()} x ${qty}
      </p>
      <p class="price">रु ${(product.price * qty).toLocaleString()}</p>
    </div>
  `;

  document.getElementById("qty-text").textContent = qty;
  document.getElementById("subtotal").textContent = `रु ${subtotal.toLocaleString()}`;
  document.getElementById("shipping").textContent = `रु ${shipping.toLocaleString()}`;
  document.getElementById("tax").textContent = `रु ${tax.toLocaleString()}`;
  document.getElementById("total").textContent = `रु ${total.toLocaleString()}`;

  window.checkoutData = {
    source: "buynow",
    product,
    qty,
    subtotal,
    tax,
    shipping,
    total,
  };
}

// ============ ORDER SUMMARY: MULTIPLE PRODUCTS (Cart) ============
function populateOrderSummaryCart(items) {
  const container = document.getElementById("product-card");
  container.innerHTML = "";

  let subtotal = 0;

  items.forEach((item) => {
    const lineTotal = item.price * item.quantity;
    subtotal += lineTotal;

    const card = document.createElement("div");
    card.style.cssText =
      "display:flex; gap:12px; padding:12px 0; border-bottom:1px solid #eee;";
    card.innerHTML = `
      <div style="position:relative; flex-shrink:0;">
        <img
          src="${item.image}"
          alt="${item.name}"
          style="width:70px; height:70px; object-fit:cover; border-radius:8px; border:1px solid #eee;"
        />
        <span style="
          position:absolute; top:-6px; right:-6px;
          background:var(--primary, #e30613); color:#fff;
          font-size:0.7rem; font-weight:700;
          width:20px; height:20px; border-radius:50%;
          display:flex; align-items:center; justify-content:center;
        ">${item.quantity}</span>
      </div>
      <div style="flex:1;">
        <h4 style="margin:0 0 4px; font-size:0.9rem;">${item.name}</h4>
        <p style="margin:0; color:#888; font-size:0.8rem;">
          रु ${item.price.toLocaleString()} x ${item.quantity}
        </p>
        <p style="margin:4px 0 0; font-weight:700; font-size:0.95rem;">
          रु ${lineTotal.toLocaleString()}
        </p>
      </div>
    `;
    container.appendChild(card);
  });

  const { tax, shipping, total } = calcPrices(subtotal);
  const totalQty = items.reduce((acc, i) => acc + i.quantity, 0);

  document.getElementById("qty-text").textContent = totalQty;
  document.getElementById("subtotal").textContent = `रु ${subtotal.toLocaleString()}`;
  document.getElementById("shipping").textContent = `रु ${shipping.toLocaleString()}`;
  document.getElementById("tax").textContent = `रु ${tax.toLocaleString()}`;
  document.getElementById("total").textContent = `रु ${total.toLocaleString()}`;

  window.checkoutData = {
    source: "cart",
    items,
    subtotal,
    tax,
    shipping,
    total,
  };
}

// ============ INITIALIZATION ============
async function init() {
  const token = getToken();
  if (!token) {
    alert("Please login to continue");
    window.location.href = "/login";
    return;
  }

  const savedCheckoutData = sessionStorage.getItem("checkoutData");
  const { productId, quantity } = getUrlParams();

  if (savedCheckoutData) {
    // ── CART FLOW ──
    try {
      const payload = JSON.parse(savedCheckoutData);
      if (payload.source === "cart" && payload.items?.length > 0) {
        populateOrderSummaryCart(payload.items);
      } else {
        alert("Cart is empty or invalid.");
        window.location.href = "/my-cart";
      }
    } catch (e) {
      console.error("Failed to parse cart session data:", e);
      alert("Something went wrong. Please try again.");
      window.location.href = "/my-cart";
    }
  } else if (productId) {
    // ── BUY NOW FLOW ──
    try {
      const product = await fetchProduct(productId);
      populateOrderSummary(product, quantity);
    } catch (err) {
      console.error("Init error:", err);
      alert("Failed to load checkout. Please try again.");
    }
  } else {
    alert("Nothing to checkout.");
    history.back();
  }
}

// ============ FORM VALIDATION ============
function validateData() {
  let isValid = true;

  const email = document.getElementById("email").value.trim();
  const emailRegex =
    /^[a-zA-Z][a-zA-Z0-9._%+-]*@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!email || !emailRegex.test(email)) {
    document.getElementById("email-error").textContent =
      "Please enter a valid email address";
    isValid = false;
  } else {
    document.getElementById("email-error").textContent = "";
  }

  const phone = document.getElementById("phone").value.trim();
  const phoneRegex = /^(98|97)[0-9]{8}$/;
  if (phone && !phoneRegex.test(phone)) {
    document.getElementById("phone-error").textContent =
      "Please enter a valid phone number";
    isValid = false;
  } else {
    document.getElementById("phone-error").textContent = "";
  }

  const recipientName = document.getElementById("recipient-name").value.trim();
  const nameRegex = /^[A-Za-z\s'-]+$/;
  if (
    !recipientName ||
    recipientName.length < 2 ||
    recipientName.length > 20 ||
    !nameRegex.test(recipientName)
  ) {
    document.getElementById("name-error").textContent =
      "Please enter a valid name (2-20 characters)";
    isValid = false;
  } else {
    document.getElementById("name-error").textContent = "";
  }

  const address = document.getElementById("address").value.trim();
  const addressRegex = /^[a-zA-Z0-9\s,.\-#/]+$/;
  if (
    !address ||
    address.length < 5 ||
    address.length > 100 ||
    !addressRegex.test(address)
  ) {
    document.getElementById("address-error").textContent =
      "Please enter a valid address (5-100 characters)";
    isValid = false;
  } else {
    document.getElementById("address-error").textContent = "";
  }

  const city = document.getElementById("city").value.trim();
  const cityRegex = /^[a-zA-Z\s.\-]+$/;
  if (
    !city ||
    city.length < 2 ||
    city.length > 50 ||
    !cityRegex.test(city)
  ) {
    document.getElementById("city-error").textContent =
      "Please enter a valid city (2-50 characters)";
    isValid = false;
  } else {
    document.getElementById("city-error").textContent = "";
  }

  const zip = document.getElementById("zip").value.trim();
  const zipRegex = /^[a-zA-Z0-9\s\-]{3,10}$/;
  if (!zip || !zipRegex.test(zip)) {
    document.getElementById("zip-error").textContent =
      "Please enter a valid zip code (3-10 characters)";
    isValid = false;
  } else {
    document.getElementById("zip-error").textContent = "";
  }

  return isValid;
}

// ============ PAYMENT ============
async function handlePayment() {
  if (!validateData()) {
    alert("Please correct the errors in the form before proceeding.");
    return;
  }

  const shippingAddress = {
    address: document.getElementById("address").value.trim(),
    city: document.getElementById("city").value.trim(),
    zipCode: document.getElementById("zip").value.trim(),
  };

  const baseInfo = {
    customerName: document.getElementById("recipient-name").value.trim(),
    customerEmail: document.getElementById("email").value.trim(),
    customerPhone: document.getElementById("phone").value.trim(),
    shippingAddress,
  };

  let orderData;
  let endpoint;

  if (window.checkoutData.source === "cart") {
    orderData = {
      ...baseInfo,
      source: "cart",
      items: window.checkoutData.items.map((i) => ({
        productId: i.productId,
        quantity: i.quantity,
      })),
    };
    endpoint = `${API_BASE_URL}/orders/initiate-esewa-payment-cart`;
  } else {
    orderData = {
      ...baseInfo,
      productId: window.checkoutData.product._id,
      quantity: window.checkoutData.qty,
    };
    endpoint = `${API_BASE_URL}/orders/initiate-esewa-payment`;
  }

  const payBtn = document.getElementById("pay-button");

  try {
    payBtn.disabled = true;
    payBtn.innerHTML =
      '<i class="fas fa-spinner fa-spin"></i> Redirecting to eSewa...';

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify(orderData),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || "Failed to initiate payment");
    }

    sessionStorage.removeItem("checkoutData");
    redirectToEsewa(result.data.esewaData);
  } catch (err) {
    console.error("Payment Error:", err);
    alert("Error: " + err.message);
    payBtn.disabled = false;
    payBtn.innerHTML = '<i class="fas fa-lock"></i> Pay Now';
  }
}

// ============ ESEWA REDIRECT ============
function redirectToEsewa(esewaData) {
  const form = document.createElement("form");
  form.method = "POST";
  form.action = esewaData.payment_url;

  for (const key in esewaData) {
    if (key !== "payment_url") {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = key;
      input.value = esewaData[key];
      form.appendChild(input);
    }
  }

  document.body.appendChild(form);
  form.submit();
}

// ============ BOOT — all DOM-dependent code lives here ============
document.addEventListener("DOMContentLoaded", () => {
  init();

  const payBtn = document.getElementById("pay-button");
  if (!payBtn) return; // safety guard — exits if not on checkout page

  payBtn.disabled = true;

  const requiredFields = ["email", "recipient-name", "address", "city", "zip"];

  function checkFormValidity() {
    const isFormValid = requiredFields.every((fieldId) => {
      const field = document.getElementById(fieldId);
      return field && field.value.trim() !== "";
    });
    payBtn.disabled = !isFormValid;
  }

  requiredFields.forEach((fieldId) => {
    const field = document.getElementById(fieldId);
    if (field) field.addEventListener("input", checkFormValidity);
  });

  payBtn.addEventListener("click", handlePayment);
});
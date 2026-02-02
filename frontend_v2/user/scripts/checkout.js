// let productData = null;
// const SHIPPING_COST = 0;
// const TAX_RATE = 0.13;

// const getIdFromURL = () => {
//   const urlParams = new URLSearchParams(window.location.search);
//   return urlParams.get("id");
// };

// async function fetchProductDetails(productId) {
//   try {
//     const response = await fetch(
//       `http://localhost:3000/api/product/${productId}`
//     );
//     if (!response.ok) {
//       throw new Error(`HTTP error! status: ${response.status}`);
//     }
//     return await response.json();
//   } catch (error) {
//     console.error("Error fetching product details:", error);
//     showError("Failed to load product details. Please try again.");
//     return null;
//   }
// }

// document.addEventListener("DOMContentLoaded", async () => {
//   const productId = getIdFromURL();

//   if (!productId) {
//     showError("No product ID found. Please select a product.");
//     return;
//   }

//   productData = await fetchProductDetails(productId);

//   if (productData) {
//     console.log("Fetched product data:", productData);
//     updateOrderSummary(productData);
//   }

//   setupFormValidation();
// });

// function setupFormValidation() {
//   const form = document.getElementById("checkout-form");
//   const emailInput = document.getElementById("email");
//   const phoneInput = document.getElementById("phone");

//   emailInput.addEventListener("blur", () => {
//     validateEmail(emailInput.value);
//   });

//   phoneInput.addEventListener("blur", () => {
//     if (phoneInput.value) {
//       validatePhone(phoneInput.value);
//     }
//   });

//   form.addEventListener("submit", (e) => {
//     e.preventDefault();

//     if (validateForm()) {
//       processPayment();
//     }
//   });
// }

// function validateEmail(email) {
//   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//   const errorElement = document.getElementById("email-error");

//   if (!email) {
//     errorElement.textContent = "Email is required";
//     return false;
//   } else if (!emailRegex.test(email)) {
//     errorElement.textContent = "Please enter a valid email";
//     return false;
//   } else {
//     errorElement.textContent = "";
//     return true;
//   }
// }

// function validatePhone(phone) {
//   const phoneRegex = /^(\+977)?[0-9]{10}$/;

//   if (phone && !phoneRegex.test(phone.replace(/\s/g, ""))) {
//     console.warn("Invalid phone number format");
//     return false;
//   }
//   return true;
// }

// function validateForm() {
//   const email = document.getElementById("email").value;
//   const name = document.getElementById("recipient-name").value;
//   const address = document.getElementById("address").value;
//   const city = document.getElementById("city").value;
//   const zip = document.getElementById("zip").value;

//   let isValid = true;

//   if (!validateEmail(email)) isValid = false;

//   if (!name.trim()) {
//     document.getElementById("name-error").textContent = "Name is required";
//     isValid = false;
//   } else {
//     document.getElementById("name-error").textContent = "";
//   }

//   if (!address.trim()) {
//     document.getElementById("address-error").textContent = "Address is required";
//     isValid = false;
//   } else {
//     document.getElementById("address-error").textContent = "";
//   }

//   if (!city.trim()) {
//     document.getElementById("city-error").textContent = "City is required";
//     isValid = false;
//   } else {
//     document.getElementById("city-error").textContent = "";
//   }

//   if (!zip.trim()) {
//     document.getElementById("zip-error").textContent = "Zip code is required";
//     isValid = false;
//   } else {
//     document.getElementById("zip-error").textContent = "";
//   }

//   return isValid;
// }

// function updateOrderSummary(data) {
//   const product = data.data;

//   document.getElementById("img").src = product.image || "";
//   document.getElementById("img").alt = product.name || "Product";
//   document.getElementById("title").textContent = product.name || "Product";
//   document.getElementById("description").textContent = product.description || "";
//   document.getElementById("price").textContent = `रु${formatPrice(product.price)}`;

//   const subtotal = product.price || 0;
//   const shipping = SHIPPING_COST;
//   const tax = subtotal * TAX_RATE;
//   const total = subtotal + shipping + tax;

//   document.getElementById("subtotal").textContent = `रु${formatPrice(subtotal)}`;
//   document.getElementById("shipping").textContent = `रु${formatPrice(shipping)}`;
//   document.getElementById("tax").textContent = `रु${formatPrice(tax)}`;
//   document.getElementById("total").textContent = `रु${formatPrice(total)}`;
// }

// function formatPrice(price) {
//   return parseFloat(price).toFixed(2);
// }

// async function processPayment() {
//   if (!productData) {
//     showError("Product data not loaded. Please refresh the page.");
//     return;
//   }

//   const payButton = document.getElementById("pay-button");
//   payButton.disabled = true;
//   payButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';

//   try {
//     const product = productData.data;
//     const amount = product.price;
//     const shipping = SHIPPING_COST;
//     const tax = amount * TAX_RATE;
//     const totalAmount = amount + shipping + tax;
//     const productCode = "EPAYTEST";

//     const hashResponse = await fetch(
//       "http://localhost:3000/api/crypto/generate-hash",
//       {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           total_amount: totalAmount,
//           product_code: productCode,
//         }),
//       }
//     );

//     if (!hashResponse.ok) {
//       throw new Error("Failed to generate payment hash");
//     }

//     const hashResult = await hashResponse.json();

//     submitEsewaPayment({
//       amount: amount,
//       tax_amount: tax,
//       total_amount: totalAmount,
//       signature: hashResult.data.hash,
//       transaction_uuid: hashResult.data.transaction_uuid,
//       product_code: productCode,
//     });

//   } catch (error) {
//     console.error("Payment processing error:", error);
//     showError("Payment failed. Please try again.");
//     payButton.disabled = false;
//     payButton.innerHTML = '<i class="fas fa-lock"></i> Pay Now';
//   }
// }

// function submitEsewaPayment(data) {
//   const form = document.createElement("form");
//   form.method = "POST";
//   form.action = "https://rc-epay.esewa.com.np/api/epay/main/v2/form";

//   const fields = {
//     amount: data.amount,
//     tax_amount: data.tax_amount,
//     total_amount: data.total_amount,
//     transaction_uuid: data.transaction_uuid,
//     product_code: data.product_code,
//     product_service_charge: 0,
//     product_delivery_charge: 0,
//     success_url: "https://developer.esewa.com.np/success",
//     failure_url: "https://developer.esewa.com.np/failure",
//     signed_field_names: "total_amount,transaction_uuid,product_code",
//     signature: data.signature,
//   };

//   console.log("Submitting payment form with fields:", fields);

//   for (let key in fields) {
//     const input = document.createElement("input");
//     input.type = "hidden";
//     input.name = key;
//     input.value = fields[key];
//     form.appendChild(input);
//   }

//   document.body.appendChild(form);
//   form.submit();
// }

// function showError(message) {
//   alert(message);
//   console.error(message);
// }

const API_BASE_URL = "http://localhost:3000/api";

// ============ GET TOKEN ============
function getToken() {
  return localStorage.getItem("accessToken");
}

// ============ GET URL PARAMS ============
function getUrlParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    productId: params.get("id"),
    quantity: parseInt(params.get("quantity")) || 1,
  };
}

// ============ FETCH PRODUCT ============
async function fetchProduct(productId) {
  const res = await fetch(`${API_BASE_URL}/product/${productId}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  const data = await res.json();
  if (data.success) return data.data;
  throw new Error(data.message || "Failed to fetch product");
}

// ============ CALCULATE PRICES ============
function calcPrices(price, qty) {
  const subtotal = price * qty;
  const tax = Math.round(subtotal * 0.13);
  const shipping = 0;
  const total = subtotal + tax + shipping;
  console.log("Calculated prices →", { subtotal, tax, shipping, total });
  return { subtotal, tax, shipping, total };
}

// ============ POPULATE ORDER SUMMARY ============
function populateOrderSummary(product, qty) {
  const { subtotal, tax, shipping, total } = calcPrices(product.price, qty);

  document.getElementById("img").src = product.image || "";

  document.getElementById("title").textContent = product.name;
  document.getElementById("description").textContent =
    product.description || "";

  document.getElementById("qty-badge").textContent = qty;

  document.getElementById("price-unit").textContent =
    `रु ${product.price.toLocaleString()} x ${qty}`;

  document.getElementById("price").textContent =
    `रु ${(product.price * qty).toLocaleString()}`;

  document.getElementById("qty-text").textContent = qty;
  document.getElementById("subtotal").textContent =
    `रु ${subtotal.toLocaleString()}`;

  document.getElementById("shipping").textContent =
    `रु ${shipping.toLocaleString()}`;
  document.getElementById("tax").textContent = `रु ${tax.toLocaleString()}`;
  document.getElementById("total").textContent = `रु ${total.toLocaleString()}`;

  // Store globally so handlePayment() can use it
  window.checkoutData = { product, qty, subtotal, tax, shipping, total };
}

// =========== INITIALIZATION ============
async function init() {
  const token = getToken();
  if (!token) {
    alert("Please login to continue");
    window.location.href = "/login";
    return;
  }

  const { productId, quantity } = getUrlParams();

  if (!productId) {
    alert("No product selected. Please go back.");
    history.back();
    return;
  }

  console.log("Checkout init → productId:", productId, "| quantity:", quantity);

  try {
    const product = await fetchProduct(productId);

    // quantity is passed here — this is where the summary gets the correct qty
    populateOrderSummary(product, quantity);
    // prefillForm(user);
  } catch (err) {
    console.error("Init error:", err);
    alert("Failed to load checkout. Please try again.");
    // history.back();
  }
}
document.addEventListener("DOMContentLoaded", init);

const payBtn = document.getElementById("pay-button");
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
  if (field) {
    field.addEventListener("input", checkFormValidity);
  }
});

function validateData() {
  let isValid = true;

  const email = document.getElementById("email").value.trim();
  const emailRegex = /^[a-zA-Z][a-zA-Z0-9._%+-]*@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  if (!email || !emailRegex.test(email)) {
    isValid = false;
    document.getElementById("email-error").textContent =
      "Please enter a valid email address";
  } else {
    document.getElementById("email-error").textContent = "";
  }

  const phone = document.getElementById("phone").value.trim();
  const phoneRegex = /^(98|97)[0-9]{8}$/;

  if (phone && !phoneRegex.test(phone)) {
    isValid = false;
    document.getElementById("phone-error").textContent =
      "Please enter a valid phone number";
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
    isValid = false;
    document.getElementById("name-error").textContent =
      "Please enter a valid name (2-20 characters)";
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
    isValid = false;
    document.getElementById("address-error").textContent =
      "Please enter a valid address (5-100 characters)";
  } else {
    document.getElementById("address-error").textContent = "";
  }

  const city = document.getElementById("city").value.trim();
  const cityRegex = /^[a-zA-Z\s.\-]+$/;
  if (!city || city.length < 2 || city.length > 50 || !cityRegex.test(city)) {
    isValid = false;
    document.getElementById("city-error").textContent =
      "Please enter a valid city (2-50 characters)";
  } else {
    document.getElementById("city-error").textContent = "";
  }

  const zip = document.getElementById("zip").value.trim();
  const zipRegex = /^[a-zA-Z0-9\s\-]{3,10}$/;
  if (!zip || !zipRegex.test(zip)) {
    isValid = false;
    document.getElementById("zip-error").textContent =
      "Please enter a valid zip code (3-10 characters)";
  } else {
    document.getElementById("zip-error").textContent = "";
  }

  return isValid;
}

async function handlePayment() {
  // 1. Validate inputs first
  if (!validateData()) {
    alert("Please correct the errors in the form before proceeding.");
    return;
  }

  const { product, qty } = window.checkoutData;
  const payBtn = document.getElementById("pay-button");

  // 2. Prepare the payload for your initiateEsewaPayment controller
  const orderData = {
    productId: product._id,
    quantity: qty,
    customerName: document.getElementById("recipient-name").value.trim(),
    customerEmail: document.getElementById("email").value.trim(),
    customerPhone: document.getElementById("phone").value.trim(),
    shippingAddress: {
      address: document.getElementById("address").value.trim(),
      city: document.getElementById("city").value.trim(),
      zipCode: document.getElementById("zip").value.trim(),
    }
  };

  try {
    // Disable button to prevent double orders
    payBtn.disabled = true;
    payBtn.textContent = "Redirecting to eSewa...";

    // 3. Call your Backend Controller
    const response = await fetch(`${API_BASE_URL}/orders/initiate-esewa-payment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${getToken()}`,
      },
      body: JSON.stringify(orderData),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || "Failed to initiate payment");
    }

    console.log("Payment initiation result:", result);
    // 4. Redirect the user using the esewaData returned by backend
    redirectToEsewa(result.data.esewaData);

  } catch (err) {
    console.error("Payment Error:", err);
    alert("Error: " + err.message);
    payBtn.disabled = false;
    payBtn.textContent = "Pay Now";
  }
}

// Helper function to perform a POST redirect to eSewa
function redirectToEsewa(esewaData) {
  const form = document.createElement("form");
  form.method = "POST";
  form.action = esewaData.payment_url;

  // Loop through the data keys (signature, transaction_uuid, etc.)
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

// Ensure the button listener is attached
payBtn.addEventListener("click", handlePayment);

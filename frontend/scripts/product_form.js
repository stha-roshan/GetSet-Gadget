const API_BASE_URL = "http://localhost:3000/api";

let productImage = null;
let productImageFile = null;
let categoriesData = [];
let brandsData = [];
let isSubmitting = false;

// ===== UTILITY FUNCTIONS (Global Scope) =====

function showToast(message, type = "error") {
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = "slideIn 0.3s ease reverse";
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function resetForm() {
  document.getElementById("productForm").reset();
  document.getElementById("nameCount").textContent = "0";
  document.getElementById("descCount").textContent = "0";
  document.getElementById("stockWarning").textContent = "";

  document.querySelectorAll(".form-group").forEach((group) => {
    group.classList.remove("error", "success");
    const feedback = group.querySelector(".input-feedback");
    if (feedback) feedback.innerHTML = "";
  });

  removeImage();
}

// ===== FETCH FUNCTIONS =====

async function fetchCategories() {
  const categorySelect = document.getElementById("productCategory");
  const categoryFeedback = document.getElementById("categoryFeedback");

  try {
    const response = await fetch(`${API_BASE_URL}/categories/category-list`);

    if (!response.ok) {
      throw new Error("Failed to fetch categories");
    }

    const result = await response.json();
    categoriesData = result.data || [];

    categorySelect.innerHTML = '<option value="">Select Category</option>';

    categoriesData.forEach((category) => {
      const option = document.createElement("option");
      option.value = category._id;
      option.textContent = category.name;
      categorySelect.appendChild(option);
    });

    categorySelect.disabled = false;
    categoryFeedback.innerHTML = "";
  } catch (error) {
    console.error("Error fetching categories:", error);
    categorySelect.innerHTML = '<option value="">Failed to load</option>';
    categoryFeedback.innerHTML =
      '<span class="error">Unable to load categories. Please refresh.</span>';
  }
}

async function fetchBrands() {
  const brandSelect = document.getElementById("productBrand");
  const brandFeedback = document.getElementById("brandFeedback");

  try {
    const response = await fetch(`${API_BASE_URL}/brands/brand-list`);

    if (!response.ok) {
      throw new Error("Failed to fetch brands");
    }

    const result = await response.json();
    brandsData = result.data || [];

    brandSelect.innerHTML = '<option value="">Select Brand</option>';

    brandsData.forEach((brand) => {
      const option = document.createElement("option");
      option.value = brand._id;
      option.textContent = brand.name;
      brandSelect.appendChild(option);
    });

    brandSelect.disabled = false;
    brandFeedback.innerHTML = "";
  } catch (error) {
    console.error("Error fetching brands:", error);
    brandSelect.innerHTML = '<option value="">Failed to load</option>';
    brandFeedback.innerHTML =
      '<span class="error">Unable to load brands. Please refresh.</span>';
  }
}

// ===== CHARACTER COUNTERS =====

document.getElementById("productName").addEventListener("input", function () {
  const count = this.value.length;
  const counter = document.getElementById("nameCount");
  counter.textContent = count;

  const remaining = counter.parentElement;
  if (count > 80) {
    remaining.classList.add("warning");
  } else {
    remaining.classList.remove("warning");
  }

  validateField(this);
});

document.getElementById("productDescription").addEventListener("input", function () {
  const count = this.value.length;
  const counter = document.getElementById("descCount");
  counter.textContent = count;

  const remaining = counter.parentElement;
  if (count > 950) {
    remaining.classList.add("critical");
    remaining.classList.remove("warning");
  } else if (count > 850) {
    remaining.classList.add("warning");
    remaining.classList.remove("critical");
  } else {
    remaining.classList.remove("warning", "critical");
  }

  validateField(this);
});

// Price validation
document.getElementById("productPrice").addEventListener("input", function () {
  validateField(this);
});

// Stock validation with warning
document.getElementById("productStock").addEventListener("input", function () {
  const warning = document.getElementById("stockWarning");
  const value = parseInt(this.value);

  if (value === 0) {
    warning.textContent = "⚠️ Out of stock";
    warning.style.color = "#d32f2f";
  } else if (value > 0 && value <= 10) {
    warning.textContent = "⚠️ Low stock level";
    warning.style.color = "#ff9800";
  } else if (value > 10) {
    warning.textContent = "✓ Good stock level";
    warning.style.color = "#4caf50";
  } else {
    warning.textContent = "";
  }

  validateField(this);
});

// Total sales validation
document.getElementById("productTotalSales").addEventListener("input", function () {
  validateField(this);
});

// ===== IMAGE UPLOAD =====

const imageUploadArea = document.getElementById("imageUploadArea");
const imageInput = document.getElementById("imageInput");
const previewContainer = document.getElementById("previewContainer");

imageUploadArea.addEventListener("click", () => imageInput.click());

imageInput.addEventListener("change", function () {
  if (this.files.length > 0) {
    handleImageFile(this.files[0]);
  }
});

function handleImageFile(file) {
  if (!file.type.startsWith("image/")) {
    showToast("Please select a valid image file", "error");
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    showToast("Image size must be less than 5MB", "error");
    return;
  }

  productImageFile = file;

  const reader = new FileReader();
  reader.onload = (e) => {
    productImage = e.target.result;
    displayImagePreview(productImage, file.name, file.size);
  };
  reader.readAsDataURL(file);
}

function displayImagePreview(src, name, size) {
  const sizeInKB = (size / 1024).toFixed(2);
  previewContainer.innerHTML = `
    <div style="text-align: center;">
      <img src="${src}" alt="Preview" class="image-preview">
      <div class="image-info">
        📄 ${name} (${sizeInKB} KB)
      </div>
      <div class="image-actions">
        <button type="button" class="btn-icon" onclick="changeImage()">Change</button>
        <button type="button" class="btn-icon" onclick="removeImage()">Remove</button>
      </div>
    </div>
  `;
  imageUploadArea.style.display = "none";
}

function changeImage() {
  productImage = null;
  productImageFile = null;
  previewContainer.innerHTML = "";
  imageUploadArea.style.display = "block";
  imageInput.value = "";
}

function removeImage() {
  changeImage();
}

// ===== FIELD VALIDATION =====

function validateField(field) {
  const parent = field.closest(".form-group");
  const feedback = parent.querySelector(".input-feedback");
  const fieldValue = field.value.trim();
  let isValid = true;
  let message = "";

  if (field.id === "productName") {
    const nameRegex = /^(?=.*[A-Za-z])[A-Za-z0-9\s''"(),.\-&/+]{2,100}$/;
    if (fieldValue.length < 2 || !nameRegex.test(fieldValue)) {
      isValid = false;
      message =
        "✗ Product name must be 2-100 characters with letters, numbers, and basic punctuation";
    } else {
      isValid = true;
      message = "✓ Product name is valid";
    }
  } else if (field.id === "productDescription") {
    const descRegex = /^(?=.*[A-Za-z])[A-Za-z0-9\s.,'"!?:;()%&/\-+]{10,1000}$/;
    if (fieldValue.length < 10 || !descRegex.test(fieldValue)) {
      isValid = false;
      message =
        "✗ Description must be 10-1000 characters with allowed punctuation";
    } else {
      isValid = true;
      message = "✓ Description is valid";
    }
  } else if (field.id === "productPrice") {
    const price = parseFloat(field.value);
    if (isNaN(price) || price <= 0 || price > 1000000) {
      isValid = false;
      message = "✗ Price must be between ₹1 and ₹1,000,000";
    } else {
      const decimalPart = field.value.split(".")[1];
      if (decimalPart && decimalPart.length > 2) {
        isValid = false;
        message = "✗ Price can have maximum 2 decimal places";
      } else {
        isValid = true;
        message = "✓ Price is valid";
      }
    }
  } else if (field.id === "productStock") {
    const stock = parseInt(field.value);
    if (
      isNaN(stock) ||
      stock < 0 ||
      stock > 1000000 ||
      !Number.isInteger(parseFloat(field.value))
    ) {
      isValid = false;
      message = "✗ Stock must be a whole number between 0 and 1,000,000";
    } else {
      isValid = true;
      message = "✓ Stock is valid";
    }
  } else if (field.id === "productTotalSales") {
    if (fieldValue) {
      const sales = parseInt(field.value);
      if (
        isNaN(sales) ||
        sales < 0 ||
        !Number.isInteger(parseFloat(field.value))
      ) {
        isValid = false;
        message = "✗ Total sales must be a whole number (0 or greater)";
      } else {
        isValid = true;
        message = "✓ Total sales is valid";
      }
    }
  }

  parent.classList.remove("error", "success");
  if (!isValid && fieldValue.length > 0) {
    parent.classList.add("error");
    feedback.innerHTML = `<span class="feedback-icon">✗</span><span class="error">${message}</span>`;
  } else if (isValid && fieldValue.length > 0) {
    parent.classList.add("success");
    feedback.innerHTML = `<span class="feedback-icon">✓</span><span class="success">${message}</span>`;
  } else {
    feedback.innerHTML = "";
  }

  return isValid;
}

// ===== FORM SUBMISSION =====

document.getElementById("productForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  if (isSubmitting) {
    return;
  }

  const submitBtn = document.getElementById("submitBtn");

  if (!productImageFile) {
    showToast("Please upload a product image", "error");
    return;
  }

  const fields = [
    "productName",
    "productDescription",
    "productPrice",
    "productStock",
  ];
  let allValid = true;

  fields.forEach((fieldId) => {
    const field = document.getElementById(fieldId);
    if (!validateField(field) || !field.value.trim()) {
      allValid = false;
    }
  });

  const totalSalesField = document.getElementById("productTotalSales");
  if (totalSalesField.value.trim()) {
    if (!validateField(totalSalesField)) {
      allValid = false;
    }
  }

  const categoryValue = document.getElementById("productCategory").value;
  const brandValue = document.getElementById("productBrand").value;

  if (!categoryValue) {
    showToast("Please select a category", "error");
    allValid = false;
  }

  if (!brandValue) {
    showToast("Please select a brand", "error");
    allValid = false;
  }

  if (!allValid) {
    showToast("Please fill all required fields correctly", "error");
    return;
  }

  const nameValue = document.getElementById("productName").value.trim();
  const descValue = document.getElementById("productDescription").value.trim();
  const priceValue = parseFloat(document.getElementById("productPrice").value);
  const stockValue = parseInt(document.getElementById("productStock").value);

  const formData = new FormData();
  formData.append("name", nameValue);
  formData.append("description", descValue);
  formData.append("category", categoryValue);
  formData.append("brand", brandValue);
  formData.append("price", priceValue);
  formData.append("stock", stockValue);
  formData.append("image", productImageFile);

  const totalSales = totalSalesField.value.trim();
  if (totalSales) {
    formData.append("totalSales", parseInt(totalSales));
  }

  isSubmitting = true;
  submitBtn.disabled = true;
  submitBtn.innerHTML =
    '<span class="loading-spinner"></span> Creating Product...';

  try {
    const response = await fetch(`${API_BASE_URL}/product/create`, {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
      if (result.errors && Array.isArray(result.errors)) {
        const errorMessages = result.errors
          .map((err) => err.message)
          .join(", ");
        throw new Error(errorMessages);
      }
      throw new Error(result.message || "Failed to create product");
    }

    // console.log("Product created:", result);
    showToast("Product created successfully!", "success");

    setTimeout(() => {
      resetForm();
    }, 1500);
  } catch (error) {
    console.error("Error creating product:", error);
    showToast(
      error.message || "Failed to create product. Please try again.",
      "error"
    );
  } finally {
    isSubmitting = false;
    submitBtn.disabled = false;
    submitBtn.innerHTML = "+ Create Product";
  }
});

// ===== INITIALIZE ON PAGE LOAD =====

async function initForm() {
  await Promise.all([fetchCategories(), fetchBrands()]);
}

initForm();
console.log("JS working");

const categoryNameInput = document.getElementById("categoryName");
const categoryDescInput = document.getElementById("categoryDescription");
const categoryImageInput = document.getElementById("categoryImage");
const uploadArea = document.getElementById("uploadArea");
const imagePreview = document.getElementById("imagePreview");
const previewImg = document.getElementById("previewImg");
const removeImageBtn = document.getElementById("removeImage");
const submitBtn = document.getElementById("submitBtn");
const categoryForm = document.getElementById("categoryForm");
const clearBtn = document.getElementById("clearBtn");
const toast = document.getElementById("toast");

// Validation state
let validationState = {
  categoryName: false,
  categoryDescription: false,
  categoryImage: false
};

let selectedFile = null;

// Disable submit button initially
submitBtn.disabled = true;

// Character counters
categoryNameInput.addEventListener("input", function() {
  document.getElementById("nameCount").textContent = this.value.length;
  validateField(this);
  updateSubmitButton();
});

categoryDescInput.addEventListener("input", function() {
  document.getElementById("descCount").textContent = this.value.length;
  validateField(this);
  updateSubmitButton();
});

// Image upload handling
uploadArea.addEventListener("click", () => {
  categoryImageInput.click();
});

// Drag and drop
uploadArea.addEventListener("dragover", (e) => {
  e.preventDefault();
  uploadArea.classList.add("drag-over");
});

uploadArea.addEventListener("dragleave", () => {
  uploadArea.classList.remove("drag-over");
});

uploadArea.addEventListener("drop", (e) => {
  e.preventDefault();
  uploadArea.classList.remove("drag-over");
  
  const files = e.dataTransfer.files;
  if (files.length > 0) {
    handleImageSelect(files[0]);
  }
});

categoryImageInput.addEventListener("change", (e) => {
  if (e.target.files.length > 0) {
    handleImageSelect(e.target.files[0]);
  }
});

function handleImageSelect(file) {
  const parent = categoryImageInput.closest(".form-group");
  const feedback = parent.querySelector(".input-feedback");
  
  // Validate file type
  const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  if (!validTypes.includes(file.type)) {
    parent.classList.remove("success");
    parent.classList.add("error");
    feedback.innerHTML = '<span class="feedback-icon">✗</span><span class="error">Please upload a valid image (PNG, JPG, JPEG, or WEBP)</span>';
    validationState.categoryImage = false;
    updateSubmitButton();
    return;
  }
  
  // Validate file size (5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB in bytes
  if (file.size > maxSize) {
    parent.classList.remove("success");
    parent.classList.add("error");
    feedback.innerHTML = '<span class="feedback-icon">✗</span><span class="error">Image size must be less than 5MB</span>';
    validationState.categoryImage = false;
    updateSubmitButton();
    return;
  }
  
  // File is valid
  selectedFile = file;
  
  // Show preview
  const reader = new FileReader();
  reader.onload = (e) => {
    previewImg.src = e.target.result;
    uploadArea.style.display = "none";
    imagePreview.style.display = "block";
  };
  reader.readAsDataURL(file);
  
  // Update validation
  parent.classList.remove("error");
  parent.classList.add("success");
  feedback.innerHTML = '<span class="feedback-icon">✓</span><span class="success">Image uploaded successfully</span>';
  validationState.categoryImage = true;
  updateSubmitButton();
}

// Remove image
removeImageBtn.addEventListener("click", () => {
  selectedFile = null;
  categoryImageInput.value = "";
  uploadArea.style.display = "block";
  imagePreview.style.display = "none";
  previewImg.src = "";
  
  const parent = categoryImageInput.closest(".form-group");
  const feedback = parent.querySelector(".input-feedback");
  parent.classList.remove("error", "success");
  feedback.innerHTML = "";
  
  validationState.categoryImage = false;
  updateSubmitButton();
});

// Validation function
function validateField(field) {
  const parent = field.closest(".form-group");
  const feedback = parent.querySelector(".input-feedback");
  const fieldValue = field.value.trim();
  let isValid = false;
  let message = "";

  if (field.id === "categoryName") {
    const categoryNameRegex = /^[a-zA-Z\s'-]{2,50}$/;

    if (fieldValue.length === 0) {
      message = "";
      isValid = false;
    } else if (fieldValue.length < 2) {
      message = "✗ Brand name must be at least 2 characters";
      isValid = false;
    } else if (!categoryNameRegex.test(fieldValue)) {
      message = "✗ Only letters, spaces, apostrophes, and hyphens allowed";
      isValid = false;
    } else {
      message = "✓ Brand name is valid";
      isValid = true;
    }
    
    validationState.categoryName = isValid;
    
  } else if (field.id === "categoryDescription") {
    const descriptionRegex = /^[a-zA-Z0-9\s.,!@#%&()'"":;/\-]{10,500}$/;

    if (fieldValue.length === 0) {
      message = "";
      isValid = false;
    } else if (fieldValue.length < 10) {
      message = "✗ Description must be at least 10 characters";
      isValid = false;
    } else if (!descriptionRegex.test(fieldValue)) {
      message = "✗ Contains invalid characters";
      isValid = false;
    } else {
      message = "✓ Description is valid";
      isValid = true;
    }
    
    validationState.categoryDescription = isValid;
  }

  // Update UI
  parent.classList.remove("error", "success");
  
  if (fieldValue.length === 0) {
    feedback.innerHTML = "";
  } else if (!isValid) {
    parent.classList.add("error");
    feedback.innerHTML = `<span class="feedback-icon">✗</span><span class="error">${message}</span>`;
  } else {
    parent.classList.add("success");
    feedback.innerHTML = `<span class="feedback-icon">✓</span><span class="success">${message}</span>`;
  }
}

// Update submit button state
function updateSubmitButton() {
  const allValid = validationState.categoryName && 
                   validationState.categoryDescription && 
                   validationState.categoryImage;
  submitBtn.disabled = !allValid;
}

// Clear button functionality
clearBtn.addEventListener("click", function() {
  categoryForm.reset();
  document.getElementById("nameCount").textContent = "0";
  document.getElementById("descCount").textContent = "0";
  
  // Clear image
  selectedFile = null;
  uploadArea.style.display = "block";
  imagePreview.style.display = "none";
  previewImg.src = "";
  
  // Clear validation states
  validationState.categoryName = false;
  validationState.categoryDescription = false;
  validationState.categoryImage = false;
  
  // Clear feedback
  document.querySelectorAll(".form-group").forEach(group => {
    group.classList.remove("error", "success");
    group.querySelector(".input-feedback").innerHTML = "";
  });
  
  // Disable submit button
  submitBtn.disabled = true;
});

// Form submission
categoryForm.addEventListener("submit", async function(e) {
  e.preventDefault();
  
  // Double check validation
  if (!validationState.categoryName || 
      !validationState.categoryDescription || 
      !validationState.categoryImage) {
    return;
  }
  
  // Create FormData for multipart/form-data
  const formData = new FormData();
  formData.append('name', categoryNameInput.value.trim());
  formData.append('description', categoryDescInput.value.trim());
  formData.append('image', selectedFile);
  
  // Disable button and show loading state
  submitBtn.disabled = true;
  const originalButtonText = submitBtn.innerHTML;
  submitBtn.innerHTML = '<span class="loading-spinner"></span> Creating...';
  
  try {
    // Make API call - UPDATE THIS URL TO YOUR ACTUAL API ENDPOINT
    const response = await fetch('/api/brands/create-brand', {
      method: 'POST',
      body: formData
      // Note: Don't set Content-Type header when using FormData
      // Browser will automatically set it with the correct boundary
    });
    
    const data = await response.json();
    
    if (response.ok) {
      // Show success toast
      showToast('Brand created successfully!', 'success');
      
      // Reset form
      categoryForm.reset();
      document.getElementById("nameCount").textContent = "0";
      document.getElementById("descCount").textContent = "0";
      
      // Clear image
      selectedFile = null;
      uploadArea.style.display = "block";
      imagePreview.style.display = "none";
      previewImg.src = "";
      
      // Clear validation states
      validationState.categoryName = false;
      validationState.categoryDescription = false;
      validationState.categoryImage = false;
      
      // Clear feedback
      document.querySelectorAll(".form-group").forEach(group => {
        group.classList.remove("error", "success");
        group.querySelector(".input-feedback").innerHTML = "";
      });
      
    } else {
      // Handle validation errors from backend
      if (data.errors && Array.isArray(data.errors)) {
        data.errors.forEach(error => {
          showToast(error.message, 'error');
        });
      } else {
        showToast(data.message || 'Failed to create brand', 'error');
      }
    }
    
  } catch (error) {
    console.error('Error creating brand:', error);
    showToast('Network error. Please try again.', 'error');
  } finally {
    // Restore button
    submitBtn.innerHTML = originalButtonText;
    updateSubmitButton();
  }
});

// Toast notification function
function showToast(message, type = 'success') {
  toast.textContent = message;
  toast.style.background = type === 'success' ? '#4caf50' : '#d32f2f';
  toast.classList.add('show');
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}
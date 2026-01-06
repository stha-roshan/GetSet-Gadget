console.log("JS working");

const categoryNameInput = document.getElementById("categoryName");
const categoryDescInput = document.getElementById("categoryDescription");
const submitBtn = document.getElementById("submitBtn");
const categoryForm = document.getElementById("categoryForm");
const clearBtn = document.querySelector(".btn-secondary");
const toast = document.getElementById("toast");

// Validation state
let validationState = {
  categoryName: false,
  categoryDescription: false
};

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
      message = "✗ Category name must be at least 2 characters";
      isValid = false;
    } else if (!categoryNameRegex.test(fieldValue)) {
      message = "✗ Only letters, spaces, apostrophes, and hyphens allowed";
      isValid = false;
    } else {
      message = "✓ Category name is valid";
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
  const allValid = validationState.categoryName && validationState.categoryDescription;
  submitBtn.disabled = !allValid;
}

// Clear button functionality
clearBtn.addEventListener("click", function() {
  categoryForm.reset();
  document.getElementById("nameCount").textContent = "0";
  document.getElementById("descCount").textContent = "0";
  
  // Clear validation states
  validationState.categoryName = false;
  validationState.categoryDescription = false;
  
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
  if (!validationState.categoryName || !validationState.categoryDescription) {
    return;
  }
  
  // Get form data
  const formData = {
    name: categoryNameInput.value.trim(),
    description: categoryDescInput.value.trim()
  };
  
  // Disable button and show loading state
  submitBtn.disabled = true;
  const originalButtonText = submitBtn.innerHTML;
  submitBtn.innerHTML = '<span class="loading-spinner"></span> Creating...';
  
  try {
    // Make API call - UPDATE THIS URL TO YOUR ACTUAL API ENDPOINT
    const response = await fetch('/api/categories/create-category', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData)
    });
    
    const data = await response.json();
    
    if (response.ok) {
      // Show success toast
      showToast('Category created successfully!', 'success');
      
      // Reset form
      categoryForm.reset();
      document.getElementById("nameCount").textContent = "0";
      document.getElementById("descCount").textContent = "0";
      
      // Clear validation states
      validationState.categoryName = false;
      validationState.categoryDescription = false;
      
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
        showToast(data.message || 'Failed to create category', 'error');
      }
    }
    
  } catch (error) {
    console.error('Error creating category:', error);
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
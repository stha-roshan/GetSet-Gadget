 const API_BASE_URL = 'http://localhost:3000/api'; // Change this to your backend port!

        // State
        let productImage = null;
        let productImageFile = null; // Store the actual file object
        let categoriesData = [];
        let brandsData = [];
        let isSubmitting = false;

        // Fetch Categories
        async function fetchCategories() {
            const categorySelect = document.getElementById('productCategory');
            const categoryFeedback = document.getElementById('categoryFeedback');
            
            try {
                const response = await fetch(`${API_BASE_URL}/categories/category-list`);
                
                if (!response.ok) {
                    throw new Error('Failed to fetch categories');
                }
                
                const result = await response.json();
                categoriesData = result.data || [];
                
                categorySelect.innerHTML = '<option value="">Select Category</option>';
                
                categoriesData.forEach(category => {
                    const option = document.createElement('option');
                    option.value = category._id;
                    option.textContent = category.name;
                    categorySelect.appendChild(option);
                });
                
                categorySelect.disabled = false;
                categoryFeedback.innerHTML = '';
                
            } catch (error) {
                console.error('Error fetching categories:', error);
                categorySelect.innerHTML = '<option value="">Failed to load</option>';
                categoryFeedback.innerHTML = '<span class="error">Unable to load categories. Please refresh.</span>';
            }
        }

        // Fetch Brands
        async function fetchBrands() {
            const brandSelect = document.getElementById('productBrand');
            const brandFeedback = document.getElementById('brandFeedback');
            
            try {
                const response = await fetch(`${API_BASE_URL}/brands/brand-list`);
                
                if (!response.ok) {
                    throw new Error('Failed to fetch brands');
                }
                
                const result = await response.json();
                brandsData = result.data || [];
                
                brandSelect.innerHTML = '<option value="">Select Brand</option>';
                
                brandsData.forEach(brand => {
                    const option = document.createElement('option');
                    option.value = brand._id;
                    option.textContent = brand.name;
                    brandSelect.appendChild(option);
                });
                
                brandSelect.disabled = false;
                brandFeedback.innerHTML = '';
                
            } catch (error) {
                console.error('Error fetching brands:', error);
                brandSelect.innerHTML = '<option value="">Failed to load</option>';
                brandFeedback.innerHTML = '<span class="error">Unable to load brands. Please refresh.</span>';
            }
        }

        // Character counters
        document.getElementById('productName').addEventListener('input', function() {
            const count = this.value.length;
            const counter = document.getElementById('nameCount');
            counter.textContent = count;
            
            const remaining = counter.parentElement;
            if (count > 80) {
                remaining.classList.add('warning');
            } else {
                remaining.classList.remove('warning');
            }
            
            validateField(this);
        });

        document.getElementById('productDescription').addEventListener('input', function() {
            const count = this.value.length;
            const counter = document.getElementById('descCount');
            counter.textContent = count;
            
            const remaining = counter.parentElement;
            if (count > 450) {
                remaining.classList.add('critical');
            } else if (count > 400) {
                remaining.classList.add('warning');
                remaining.classList.remove('critical');
            } else {
                remaining.classList.remove('warning', 'critical');
            }
            
            validateField(this);
        });

        // Price validation
        document.getElementById('productPrice').addEventListener('input', function() {
            validateField(this);
        });

        // Stock validation with warning
        document.getElementById('productStock').addEventListener('input', function() {
            const warning = document.getElementById('stockWarning');
            const value = parseInt(this.value);
            
            if (value === 0) {
                warning.textContent = '⚠️ Out of stock';
                warning.style.color = '#d32f2f';
            } else if (value > 0 && value <= 10) {
                warning.textContent = '⚠️ Low stock level';
                warning.style.color = '#ff9800';
            } else if (value > 10) {
                warning.textContent = '✓ Good stock level';
                warning.style.color = '#4caf50';
            } else {
                warning.textContent = '';
            }
            
            validateField(this);
        });

        // Total sales validation
        document.getElementById('productTotalSales').addEventListener('input', function() {
            validateField(this);
        });

        // Image upload
        const imageUploadArea = document.getElementById('imageUploadArea');
        const imageInput = document.getElementById('imageInput');
        const previewContainer = document.getElementById('previewContainer');

        imageUploadArea.addEventListener('click', () => imageInput.click());

        imageInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                handleImageFile(e.target.files[0]);
            }
        });

        // Drag and drop
        imageUploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            imageUploadArea.classList.add('dragover');
        });

        imageUploadArea.addEventListener('dragleave', () => {
            imageUploadArea.classList.remove('dragover');
        });

        imageUploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            imageUploadArea.classList.remove('dragover');
            
            if (e.dataTransfer.files.length > 0) {
                handleImageFile(e.dataTransfer.files[0]);
            }
        });

        function handleImageFile(file) {
            if (!file.type.startsWith('image/')) {
                showToast('Please select a valid image file', 'error');
                return;
            }

            if (file.size > 5 * 1024 * 1024) {
                showToast('Image size must be less than 5MB', 'error');
                return;
            }

            // Store both the file object and preview
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
            imageUploadArea.style.display = 'none';
        }

        function changeImage() {
            productImage = null;
            productImageFile = null;
            previewContainer.innerHTML = '';
            imageUploadArea.style.display = 'block';
            imageInput.value = '';
        }

        function removeImage() {
            changeImage();
        }

        // Field validation
        function validateField(field) {
            const parent = field.closest('.form-group');
            const feedback = parent.querySelector('.input-feedback');
            const fieldValue = field.value.trim();
            let isValid = true;
            let message = '';

            if (field.id === 'productName') {
                const nameRegex = /^[A-Za-z0-9\s''"(),.-]{2,100}$/;
                if (fieldValue.length < 2 || !nameRegex.test(fieldValue)) {
                    isValid = false;
                    message = '✗ Product name must be 2-100 characters with letters, numbers, and basic punctuation';
                } else {
                    isValid = true;
                    message = '✓ Product name is valid';
                }
            } else if (field.id === 'productDescription') {
                const descRegex = /^[A-Za-z0-9\s.,'"!?:;()%&/\-+]{10,500}$/;
                if (fieldValue.length < 10 || !descRegex.test(fieldValue)) {
                    isValid = false;
                    message = '✗ Description must be 10-500 characters with allowed punctuation';
                } else {
                    isValid = true;
                    message = '✓ Description is valid';
                }
            } else if (field.id === 'productPrice') {
                const price = parseFloat(field.value);
                if (isNaN(price) || price <= 0 || price > 1000000) {
                    isValid = false;
                    message = '✗ Price must be between ₹1 and ₹1,000,000';
                } else {
                    // Check decimal places
                    const decimalPart = field.value.split('.')[1];
                    if (decimalPart && decimalPart.length > 2) {
                        isValid = false;
                        message = '✗ Price can have maximum 2 decimal places';
                    } else {
                        isValid = true;
                        message = '✓ Price is valid';
                    }
                }
            } else if (field.id === 'productStock') {
                const stock = parseInt(field.value);
                if (isNaN(stock) || stock < 0 || stock > 1000000 || !Number.isInteger(parseFloat(field.value))) {
                    isValid = false;
                    message = '✗ Stock must be a whole number between 0 and 1,000,000';
                } else {
                    isValid = true;
                    message = '✓ Stock is valid';
                }
            } else if (field.id === 'productTotalSales') {
                if (fieldValue) {
                    const sales = parseInt(field.value);
                    if (isNaN(sales) || sales < 0 || !Number.isInteger(parseFloat(field.value))) {
                        isValid = false;
                        message = '✗ Total sales must be a whole number (0 or greater)';
                    } else {
                        isValid = true;
                        message = '✓ Total sales is valid';
                    }
                }
            }

            parent.classList.remove('error', 'success');
            if (!isValid && fieldValue.length > 0) {
                parent.classList.add('error');
                feedback.innerHTML = `<span class="feedback-icon">✗</span><span class="error">${message}</span>`;
            } else if (isValid && fieldValue.length > 0) {
                parent.classList.add('success');
                feedback.innerHTML = `<span class="feedback-icon">✓</span><span class="success">${message}</span>`;
            } else {
                feedback.innerHTML = '';
            }

            return isValid;
        }

        // Form submission
        document.getElementById('productForm').addEventListener('submit', async (e) => {
            e.preventDefault();

            // Prevent double submission
            if (isSubmitting) {
                return;
            }

            const submitBtn = document.getElementById('submitBtn');

            // Validate image
            if (!productImageFile) {
                showToast('Please upload a product image', 'error');
                return;
            }

            // Validate all required fields
            const fields = ['productName', 'productDescription', 'productPrice', 'productStock'];
            let allValid = true;
            
            fields.forEach(fieldId => {
                const field = document.getElementById(fieldId);
                if (!validateField(field) || !field.value.trim()) {
                    allValid = false;
                }
            });

            // Validate totalSales if provided
            const totalSalesField = document.getElementById('productTotalSales');
            if (totalSalesField.value.trim()) {
                if (!validateField(totalSalesField)) {
                    allValid = false;
                }
            }

            // Check category and brand
            const categoryValue = document.getElementById('productCategory').value;
            const brandValue = document.getElementById('productBrand').value;
            
            if (!categoryValue) {
                showToast('Please select a category', 'error');
                allValid = false;
            }
            
            if (!brandValue) {
                showToast('Please select a brand', 'error');
                allValid = false;
            }

            if (!allValid) {
                showToast('Please fill all required fields correctly', 'error');
                return;
            }

            // Additional backend-style validations
            const nameValue = document.getElementById('productName').value.trim();
            const descValue = document.getElementById('productDescription').value.trim();
            const priceValue = document.getElementById('productPrice').value;
            const stockValue = document.getElementById('productStock').value;

            const nameRegex = /^[A-Za-z0-9\s''"(),.-]{2,100}$/;
            const descRegex = /^[A-Za-z0-9\s.,'"!?:;()%&/\-+]{10,500}$/;

            if (!nameRegex.test(nameValue)) {
                showToast('Product name contains invalid characters', 'error');
                return;
            }

            if (!descRegex.test(descValue)) {
                showToast('Description contains invalid characters or wrong length', 'error');
                return;
            }

            const price = parseFloat(priceValue);
            if (price <= 0 || price > 1000000) {
                showToast('Price must be between ₹1 and ₹1,000,000', 'error');
                return;
            }

            const stock = parseInt(stockValue);
            if (stock < 0 || stock > 1000000) {
                showToast('Stock must be between 0 and 1,000,000', 'error');
                return;
            }

            // Prepare FormData for file upload
            const formData = new FormData();
            formData.append('name', nameValue);
            formData.append('description', descValue);
            formData.append('category', categoryValue);
            formData.append('brand', brandValue);
            formData.append('price', price);
            formData.append('stock', stock);
            formData.append('image', productImageFile);
            
            const totalSales = totalSalesField.value.trim();
            if (totalSales) {
                formData.append('totalSales', parseInt(totalSales));
            }

            // Submit to backend
            isSubmitting = true;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="loading-spinner"></span> Creating Product...';

            try {
                const response = await fetch(`${API_BASE_URL}/product/create`, {
                    method: 'POST',
                    body: formData
                });

                const result = await response.json();

                if (!response.ok) {
                    // Handle validation errors from backend
                    if (result.errors && Array.isArray(result.errors)) {
                        const errorMessages = result.errors.map(err => err.message).join(', ');
                        throw new Error(errorMessages);
                    }
                    throw new Error(result.message || 'Failed to create product');
                }

                console.log('Product created:', result);
                showToast('Product created successfully! 🎉', 'success');
                
                // Reset form after 1.5 seconds
                setTimeout(() => {
                    resetForm();
                }, 1500);

            } catch (error) {
                console.error('Error creating product:', error);
                showToast(error.message || 'Failed to create product. Please try again.', 'error');
            } finally {
                isSubmitting = false;
                submitBtn.disabled = false;
                submitBtn.innerHTML = '+ Create Product';
            }
        });

        // Reset form
        function resetForm() {
            document.getElementById('productForm').reset();
            document.getElementById('nameCount').textContent = '0';
            document.getElementById('descCount').textContent = '0';
            document.getElementById('stockWarning').textContent = '';
            
            // Clear all validation states
            document.querySelectorAll('.form-group').forEach(group => {
                group.classList.remove('error', 'success');
                const feedback = group.querySelector('.input-feedback');
                if (feedback) feedback.innerHTML = '';
            });
            
            // Reset image
            removeImage();
        }

        // Toast notification
        function showToast(message, type = 'error') {
            const toast = document.createElement('div');
            toast.className = `toast ${type}`;
            toast.textContent = message;
            document.body.appendChild(toast);

            setTimeout(() => {
                toast.style.animation = 'slideIn 0.3s ease reverse';
                setTimeout(() => toast.remove(), 300);
            }, 3000);
        }

        // Initialize - Load categories and brands on page load
        async function initForm() {
            await Promise.all([
                fetchCategories(),
                fetchBrands()
            ]);
        }

        // Load data when page loads
        initForm();
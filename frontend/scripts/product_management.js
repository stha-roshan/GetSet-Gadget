console.log("js working");

const products = [
  {
    id: 1,
    name: "Wireless Headphones",
    description: "High-quality noise-canceling headphones",
    brand: "Sony",
    category: "Audio",
    price: 2999,
    stock: 15,
  },

  {
    id: 3,
    name: "Gaming Laptop Pro",
    description: "High-performance laptop with RTX graphics",
    brand: "Asus",
    category: "Computers",
    price: 125000,
    stock: 8,
  },
  {
    id: 4,
    name: "Bluetooth Speaker",
    description: "Portable speaker with deep bass",
    brand: "JBL",
    category: "Audio",
    price: 4999,
    stock: 30,
  },
  {
    id: 5,
    name: "Smartwatch Fit",
    description: "Fitness tracking smartwatch with heart-rate monitor",
    brand: "Apple",
    category: "Wearables",
    price: 39999,
    stock: 20,
  },
  {
    id: 6,
    name: "Mechanical Keyboard",
    description: "RGB backlit mechanical gaming keyboard",
    brand: "Razer",
    category: "Accessories",
    price: 7999,
    stock: 12,
  },
  {
    id: 7,
    name: "4K LED TV",
    description: "Ultra HD Smart TV with HDR",
    brand: "LG",
    category: "Electronics",
    price: 89999,
    stock: 10,
  },
  {
    id: 8,
    name: "External SSD 1TB",
    description: "Fast portable SSD storage",
    brand: "SanDisk",
    category: "Storage",
    price: 12999,
    stock: 40,
  },
  {
    id: 9,
    name: "Wireless Mouse",
    description: "Ergonomic mouse with long battery life",
    brand: "Logitech",
    category: "Accessories",
    price: 2499,
    stock: 50,
  },
  {
    id: 10,
    name: "Digital Camera",
    description: "Mirrorless camera with 24MP sensor",
    brand: "Canon",
    category: "Photography",
    price: 65000,
    stock: 5,
  },
];

function renderProducts(products) {
  const grid = document.getElementById("productsGrid");
  grid.innerHTML = "";

  products.forEach((product) => {
    const card = document.createElement("div");
    card.className = "product-card";

    card.innerHTML = `
          <div class="product-image placeholder">📷 No Image</div>
          <div class="product-info" id="productInfo">
            <div class="product-id" id="productId">ID: #${product.id}</div>
            <div class="product-name" id="productName">${product.name}</div>
            <div class="product-description" id="productDescription">${product.description}</div>
            <div class="product-brand-category" id="productBrand">
                <span class="badge">${product.brand}</span>
                <span class="badge">${product.category}</span>
            </div>
            <div class="product-details">
                <div class="detail-item">
                    <span class="detail-label">Price</span>
                    <span class="price" id="productPrice">${product.price}</span>
                </div>

                <div class="detail-item">
                    <span class="detail-label">Stock</span>
                    <span class="stock-badge " id="productStock">${product.stock}</span>
                </div>
            </div>
            <div class="product-actions">
                <button class="btn-small edit" id="edit">✎ Edit</button>
                <button class="btn-small delete" id="delete">🗑 Delete</button>
            </div>
          </div>  
          `;
    grid.appendChild(card);
  });
}

renderProducts(products);

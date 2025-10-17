const API_URL = 'http://localhost:3000/api';
let currentUser = null;
let map = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    initializeMap();
    loadFarmers();
    loadProducts();
    setupEventListeners();
});

// Check authentication
function checkAuth() {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
        currentUser = JSON.parse(user);
        updateUIForLoggedInUser();
    }
}

// Update UI for logged in user
function updateUIForLoggedInUser() {
    document.getElementById('loginBtn').style.display = 'none';
    document.getElementById('registerBtn').style.display = 'none';
    document.getElementById('userInfo').style.display = 'inline-block';
    document.getElementById('userName').textContent = currentUser.name;
}

// Initialize Map
function initializeMap() {
    map = L.map('map').setView([20.5937, 78.9629], 5); // India center
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);
}

// Load Farmers
async function loadFarmers() {
    try {
        const response = await fetch(`${API_URL}/farmers`);
        const farmers = await response.json();
        
        displayFarmers(farmers);
        addFarmersToMap(farmers);
    } catch (error) {
        console.error('Error loading farmers:', error);
    }
}

// Add this to your script.js or dashboard JS file

function showAddProductForm() {
  // Create or show a modal with product form
  const formHTML = `
    <div id="productModal" class="modal" style="display: block;">
      <div class="modal-content">
        <span class="close" onclick="closeProductModal()">&times;</span>
        <h2>Add New Product</h2>
        <form id="addProductForm">
          <input type="text" id="productName" placeholder="Product Name" required>
          
          <select id="productCategory" required>
            <option value="">Select Category</option>
            <option value="Vegetables">Vegetables</option>
            <option value="Fruits">Fruits</option>
            <option value="Grains">Grains</option>
            <option value="Dairy">Dairy</option>
            <option value="Herbs">Herbs</option>
          </select>
          
          <textarea id="productDescription" placeholder="Description"></textarea>
          
          <input type="number" id="productPrice" placeholder="Price per unit" step="0.01" required>
          
          <input type="text" id="productUnit" placeholder="Unit (kg, liters, etc.)" value="kg">
          
          <input type="number" id="productQuantity" placeholder="Quantity Available" step="0.01" required>
          
          <label>
            <input type="checkbox" id="isOrganic"> Organic Product
          </label>
          
          <button type="submit" class="btn btn-primary">Add Product</button>
        </form>
      </div>
    </div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', formHTML);
  
  // Handle form submission
  document.getElementById('addProductForm').addEventListener('submit', handleAddProduct);
}

async function handleAddProduct(e) {
  e.preventDefault();
  
  const productData = {
    farmer_id: currentUser.id,
    name: document.getElementById('productName').value,
    category: document.getElementById('productCategory').value,
    description: document.getElementById('productDescription').value,
    price: document.getElementById('productPrice').value,
    unit: document.getElementById('productUnit').value,
    quantity_available: document.getElementById('productQuantity').value,
    is_organic: document.getElementById('isOrganic').checked
  };
  
  try {
    const response = await fetch('http://localhost:3000/api/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem('token')
      },
      body: JSON.stringify(productData)
    });
    
    const data = await response.json();
    
    if (response.ok) {
      alert('✅ Product added successfully!');
      closeProductModal();
      loadFarmerDashboard(); // Refresh the dashboard
    } else {
      alert('❌ Error: ' + (data.error || 'Failed to add product'));
    }
  } catch (error) {
    alert('❌ Network error: ' + error.message);
  }
}

function closeProductModal() {
  const modal = document.getElementById('productModal');
  if (modal) modal.remove();
}

// Display Farmers
function displayFarmers(farmers) {
    const farmersList = document.getElementById('farmersList');
    farmersList.innerHTML = '';
    
    farmers.forEach(farmer => {
        const farmerCard = `
            <div class="card">
                <h3>${farmer.farm_name || farmer.name}</h3>
                <p>📍 ${farmer.city}, ${farmer.state}</p>
                <p>${farmer.farm_description || 'Local farmer'}</p>
                <p>🚚 Delivery Radius: ${farmer.delivery_radius} km</p>
                ${farmer.is_verified ? '<span class="status-badge status-confirmed">✓ Verified</span>' : ''}
                <button class="btn btn-primary" onclick="viewFarmer(${farmer.id})">View Products</button>
                <button class="btn btn-secondary" onclick="contactFarmer(${farmer.id})">Contact</button>
            </div>
        `;
        farmersList.innerHTML += farmerCard;
    });
}

// Add Farmers to Map
function addFarmersToMap(farmers) {
    farmers.forEach(farmer => {
        if (farmer.latitude && farmer.longitude) {
            const marker = L.marker([farmer.latitude, farmer.longitude]).addTo(map);
            marker.bindPopup(`
                <b>${farmer.farm_name || farmer.name}</b><br>
                ${farmer.city}, ${farmer.state}<br>
                <button onclick="viewFarmer(${farmer.id})">View Products</button>
            `);
        }
    });
}

// Load Products
async function loadProducts() {
    try {
        const response = await fetch(`${API_URL}/products`);
        const products = await response.json();
        
        displayProducts(products);
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

// Display Products
function displayProducts(products) {
    const productsList = document.getElementById('productsList');
    productsList.innerHTML = '';
    
    products.forEach(product => {
        const productCard = `
            <div class="card">
                <h3>${product.name}</h3>
                <p class="price">₹${product.price}/${product.unit}</p>
                <p>🌱 Category: ${product.category}</p>
                <p>📦 Available: ${product.quantity_available} ${product.unit}</p>
                <p>👨‍🌾 Farmer: ${product.farmer_name}</p>
                <p>📍 ${product.city}, ${product.state}</p>
                ${product.is_organic ? '<span class="status-badge status-confirmed">🌿 Organic</span>' : ''}
                <button class="btn btn-primary" onclick="addToCart(${product.id})">Add to Cart</button>
            </div>
        `;
        productsList.innerHTML += productCard;
    });
}

// Search Products
async function searchProducts() {
    const searchTerm = document.getElementById('searchInput').value;
    const category = document.getElementById('categoryFilter').value;
    
    try {
        const response = await fetch(`${API_URL}/products/search?search=${searchTerm}&category=${category}`);
        const products = await response.json();
        displayProducts(products);
    } catch (error) {
        console.error('Error searching products:', error);
    }
}

// View Farmer
async function viewFarmer(farmerId) {
    try {
        const response = await fetch(`${API_URL}/products/farmer/${farmerId}`);
        const products = await response.json();
        displayProducts(products);
        
        // Scroll to products section
        document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
        console.error('Error loading farmer products:', error);
    }
}

// Contact Farmer
function contactFarmer(farmerId) {
    if (!currentUser) {
        alert('Please login to contact farmers');
        showLoginModal();
        return;
    }
    
    // Redirect to messaging interface
    window.location.href = `/messages.html?farmer=${farmerId}`;
}

// Add to Cart
function addToCart(productId) {
    if (!currentUser) {
        alert('Please login to add items to cart');
        showLoginModal();
        return;
    }
    
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    cart.push(productId);
    localStorage.setItem('cart', JSON.stringify(cart));
    alert('Product added to cart!');
}

// Setup Event Listeners
function setupEventListeners() {
    // Login
    document.getElementById('loginBtn').addEventListener('click', showLoginModal);
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    
    // Register
    document.getElementById('registerBtn').addEventListener('click', showRegisterModal);
    document.getElementById('registerForm').addEventListener('submit', handleRegister);
    document.getElementById('userType').addEventListener('change', toggleFarmerFields);
    
    // Logout
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);
    
    // Dashboard
    document.getElementById('dashboardBtn').addEventListener('click', showDashboard);
    
    // Search
    document.getElementById('searchBtn').addEventListener('click', searchProducts);
    
    // Close modals
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', function() {
            this.parentElement.parentElement.style.display = 'none';
        });
    });
}

// Show Login Modal
function showLoginModal() {
    document.getElementById('loginModal').style.display = 'block';
}

// Show Register Modal
function showRegisterModal() {
    document.getElementById('registerModal').style.display = 'block';
}

// Toggle Farmer Fields
function toggleFarmerFields() {
    const userType = document.getElementById('userType').value;
    const farmerFields = document.getElementById('farmerFields');
    farmerFields.style.display = userType === 'farmer' ? 'block' : 'none';
}

// Handle Login
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    try {
        const response = await fetch(`${API_URL}/users/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            currentUser = data.user;
            
            updateUIForLoggedInUser();
            document.getElementById('loginModal').style.display = 'none';
            alert('Login successful!');
        } else {
            alert(data.error || 'Login failed');
        }
    } catch (error) {
        console.error('Error during login:', error);
        alert('Login failed');
    }
}

// Handle Register
async function handleRegister(e) {
    e.preventDefault();
    
    const userData = {
        email: document.getElementById('regEmail').value,
        password: document.getElementById('regPassword').value,
        user_type: document.getElementById('userType').value,
        name: document.getElementById('regName').value,
        phone: document.getElementById('regPhone').value,
        city: document.getElementById('regCity').value,
        state: document.getElementById('regState').value,
        address: document.getElementById('regAddress').value
    };
    
    if (userData.user_type === 'farmer') {
        userData.farm_name = document.getElementById('farmName').value;
        userData.farm_size = document.getElementById('farmSize').value;
        userData.farm_description = document.getElementById('farmDescription').value;
    }
    
    try {
        const response = await fetch(`${API_URL}/users/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            alert('Registration successful! Please login.');
            document.getElementById('registerModal').style.display = 'none';
            showLoginModal();
        } else {
            alert(data.error || 'Registration failed');
        }
    } catch (error) {
        console.error('Error during registration:', error);
        alert('Registration failed');
    }
}

// Handle Logout
function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    currentUser = null;
    
    document.getElementById('loginBtn').style.display = 'inline-block';
    document.getElementById('registerBtn').style.display = 'inline-block';
    document.getElementById('userInfo').style.display = 'none';
    document.getElementById('dashboard').style.display = 'none';
    
    alert('Logged out successfully');
}

// Show Dashboard
async function showDashboard() {
    const dashboardSection = document.getElementById('dashboard');
    const dashboardContent = document.getElementById('dashboardContent');
    
    dashboardSection.style.display = 'block';
    dashboardSection.scrollIntoView({ behavior: 'smooth' });
    
    if (currentUser.user_type === 'farmer') {
        await loadFarmerDashboard();
    } else {
        await loadBuyerDashboard();
    }
}

// Load Farmer Dashboard
async function loadFarmerDashboard() {
    const dashboardContent = document.getElementById('dashboardContent');
    
    try {
        // Load products
        const productsResponse = await fetch(`${API_URL}/products/farmer/${currentUser.id}`);
        const products = await productsResponse.json();
        
        // Load orders
        const ordersResponse = await fetch(`${API_URL}/orders/farmer/${currentUser.id}`);
        const orders = await ordersResponse.json();
        
        dashboardContent.innerHTML = `
            <h3>My Products</h3>
            <button class="btn btn-primary" onclick="showAddProductForm()">Add New Product</button>
            <div id="myProducts" class="grid"></div>
            
            <h3 style="margin-top: 2rem;">My Orders</h3>
            <table class="table">
                <thead>
                    <tr>
                        <th>Order ID</th>
                        <th>Buyer</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Date</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody id="ordersTableBody"></tbody>
            </table>
        `;
        
        // Display products
        const myProducts = document.getElementById('myProducts');
        products.forEach(product => {
            myProducts.innerHTML += `
                <div class="card">
                    <h3>${product.name}</h3>
                    <p class="price">₹${product.price}/${product.unit}</p>
                    <p>Available: ${product.quantity_available} ${product.unit}</p>
                    <button class="btn btn-secondary" onclick="editProduct(${product.id})">Edit</button>
                </div>
            `;
        });
        
        // Display orders
        const ordersTableBody = document.getElementById('ordersTableBody');
        orders.forEach(order => {
            ordersTableBody.innerHTML += `
                <tr>
                    <td>#${order.id}</td>
                    <td>${order.buyer_name}</td>
                    <td>₹${order.total_amount}</td>
                    <td><span class="status-badge status-${order.status}">${order.status}</span></td>
                    <td>${new Date(order.created_at).toLocaleDateString()}</td>
                    <td>
                        <button class="btn btn-small" onclick="updateOrderStatus(${order.id}, 'confirmed')">Confirm</button>
                        <button class="btn btn-small" onclick="updateOrderStatus(${order.id}, 'delivered')">Deliver</button>
                    </td>
                </tr>
            `;
        });
    } catch (error) {
        console.error('Error loading farmer dashboard:', error);
    }
}

// Load Buyer Dashboard
async function loadBuyerDashboard() {
    const dashboardContent = document.getElementById('dashboardContent');
    
    try {
        const ordersResponse = await fetch(`${API_URL}/orders/buyer/${currentUser.id}`);
        const orders = await ordersResponse.json();
        
        dashboardContent.innerHTML = `
            <h3>My Orders</h3>
            <table class="table">
                <thead>
                    <tr>
                        <th>Order ID</th>
                        <th>Farmer</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Date</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody id="ordersTableBody"></tbody>
            </table>
        `;
        
        const ordersTableBody = document.getElementById('ordersTableBody');
        orders.forEach(order => {
            ordersTableBody.innerHTML += `
                <tr>
                    <td>#${order.id}</td>
                    <td>${order.farmer_name}</td>
                    <td>₹${order.total_amount}</td>
                    <td><span class="status-badge status-${order.status}">${order.status}</span></td>
                    <td>${new Date(order.created_at).toLocaleDateString()}</td>
                    <td>
                        <button class="btn btn-small" onclick="viewOrderDetails(${order.id})">View</button>
                        ${order.status === 'delivered' ? `<button class="btn btn-small" onclick="showReviewForm(${order.farmer_id}, ${order.id})">Review</button>` : ''}
                    </td>
                </tr>
            `;
        });
    } catch (error) {
        console.error('Error loading buyer dashboard:', error);
    }
}

// Mock Database
let currentUser = null;

const mockData = {
    users: [
        { id: 1, username: 'john_farmer', email: 'john@farm.com', role: 'farmer', created_at: '2025-01-15' },
        { id: 2, username: 'alice_buyer', email: 'alice@buyer.com', role: 'buyer', created_at: '2025-02-20' },
        { id: 3, username: 'bob_buyer', email: 'bob@buyer.com', role: 'buyer', created_at: '2025-03-10' }
    ],
    products: [
        { id: 1, name: 'Organic Tomatoes', description: 'Fresh organic tomatoes', price: 25.00, seller_id: 1, stock: 150 },
        { id: 2, name: 'Organic Apple', description: 'Farm fresh apples', price: 120.00, seller_id: 1, stock: 8 },
        { id: 3, name: 'Organic Watermelon', description: 'Soft and watery', price: 90.00, seller_id: 1, stock: 0 }
    ],
    orders: [
        { id: 1, buyer_id: 2, product_id: 1, quantity: 10, total_price: 25.00, order_date: '2025-10-10' },
        { id: 2, buyer_id: 3, product_id: 2, quantity: 5, total_price: 120.00, order_date: '2025-10-12' }
    ],
    reviews: [
        { id: 1, farmer_id: 1, buyer_id: 2, order_id: 1, rating: 5, comment: 'Excellent quality tomatoes! Very fresh and tasty.', created_at: '2025-10-11 14:30:00' },
        { id: 2, farmer_id: 1, buyer_id: 3, order_id: 2, rating: 4, comment: 'Good eggs, but packaging could be better.', created_at: '2025-10-13 09:15:00' }
    ],
    inventory_logs: [
        { id: 1, product_id: 1, change_type: 'stock_in', quantity_change: 200, notes: 'Fresh harvest', created_at: '2025-10-01' },
        { id: 2, product_id: 1, change_type: 'stock_out', quantity_change: -50, notes: 'Sold at market', created_at: '2025-10-10' }
    ]
};

// DOM Elements
const reviewModal = document.getElementById('reviewModal');
const inventoryModal = document.getElementById('inventoryModal');
const loginForm = document.getElementById('loginForm');
const reviewForm = document.getElementById('reviewForm');
const inventoryForm = document.getElementById('inventoryForm');
const logoutBtn = document.getElementById('logoutBtn');
const currentUserSpan = document.getElementById('currentUser');
const navBtns = document.querySelectorAll('.nav-btn');
const viewSections = document.querySelectorAll('.view-section');

// Initialize
init();

function init() {
    setupEventListeners();
    if (!currentUser) {
        showModal(loginModal);
    }
}

function setupEventListeners() {
    // Navigation
    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const view = btn.dataset.view;
            switchView(view);
        });
    });

    // Login
    loginForm.addEventListener('submit', handleLogin);
    logoutBtn.addEventListener('click', handleLogout);

    // Reviews
    document.getElementById('addReviewBtn').addEventListener('click', () => showModal(reviewModal));
    reviewForm.addEventListener('submit', handleReviewSubmit);
    document.getElementById('ratingFilter').addEventListener('change', filterReviews);
    document.getElementById('reviewSearch').addEventListener('input', filterReviews);

    // Star rating
    document.querySelectorAll('.star').forEach(star => {
        star.addEventListener('click', handleStarClick);
    });

    // Inventory
    document.getElementById('addInventoryBtn').addEventListener('click', () => {
        loadProductOptions();
        showModal(inventoryModal);
    });
    inventoryForm.addEventListener('submit', handleInventorySubmit);

    // Close modals
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', () => {
            closeBtn.closest('.modal').classList.remove('active');
        });
    });
}

function switchView(view) {
    navBtns.forEach(btn => btn.classList.remove('active'));
    viewSections.forEach(section => section.classList.remove('active'));
    
    document.querySelector(`[data-view="${view}"]`).classList.add('active');
    document.getElementById(`${view}View`).classList.add('active');

    if (view === 'reviews') loadReviews();
    if (view === 'inventory') loadInventory();
    if (view === 'orders') loadOrders();
}

function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('email').value.trim();
    const role = document.getElementById('userRole').value;

    let user = mockData.users.find(u => u.username === username && u.email === email);

    if (!user) {
        user = {
            id: mockData.users.length + 1,
            username,
            email,
            role,
            created_at: new Date().toISOString().split('T')[0]
        };
        mockData.users.push(user);
    }

    currentUser = user;
    currentUserSpan.textContent = username;
    hideModal(loginModal);
    loadReviews();
}

function handleLogout() {
    currentUser = null;
    currentUserSpan.textContent = 'Guest';
    showModal(loginModal);
}

function handleStarClick(e) {
    const rating = e.target.dataset.rating;
    document.getElementById('reviewRating').value = rating;
    
    document.querySelectorAll('.star').forEach((star, index) => {
        if (index < rating) {
            star.classList.add('active');
            star.textContent = '★';
        } else {
            star.classList.remove('active');
            star.textContent = '☆';
        }
    });
}

function handleReviewSubmit(e) {
    e.preventDefault();
    
    const newReview = {
        id: mockData.reviews.length + 1,
        farmer_id: 1, // Assume reviewing farmer with ID 1
        buyer_id: currentUser.id,
        order_id: parseInt(document.getElementById('reviewOrderId').value),
        rating: parseInt(document.getElementById('reviewRating').value),
        comment: document.getElementById('reviewComment').value.trim(),
        created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };

    mockData.reviews.push(newReview);
    hideModal(reviewModal);
    reviewForm.reset();
    document.querySelectorAll('.star').forEach(star => {
        star.classList.remove('active');
        star.textContent = '☆';
    });
    loadReviews();
}

function loadReviews() {
    const reviewsList = document.getElementById('reviewsList');
    reviewsList.innerHTML = '';

    const reviews = getFilteredReviews();

    reviews.forEach(review => {
        const buyer = mockData.users.find(u => u.id === review.buyer_id);
        const order = mockData.orders.find(o => o.id === review.order_id);
        const product = order ? mockData.products.find(p => p.id === order.product_id) : null;

        const reviewCard = document.createElement('div');
        reviewCard.className = 'review-card';
        reviewCard.innerHTML = `
            <div class="review-header">
                <div class="reviewer-info">
                    <div class="reviewer-avatar">${buyer.username.charAt(0).toUpperCase()}</div>
                    <div>
                        <div class="reviewer-name">${buyer.username}</div>
                        <div style="font-size:12px;color:#777;">${product ? product.name : 'Unknown Product'}</div>
                    </div>
                </div>
                <div class="review-stars">${getStars(review.rating)}</div>
            </div>
            <div class="review-comment">${review.comment}</div>
            <div class="review-meta">
                <span>Order #${review.order_id}</span>
                <span>${formatDate(review.created_at)}</span>
            </div>
        `;
        reviewsList.appendChild(reviewCard);
    });
}

function getFilteredReviews() {
    let reviews = [...mockData.reviews];
    const ratingFilter = document.getElementById('ratingFilter').value;
    const searchTerm = document.getElementById('reviewSearch').value.toLowerCase();

    if (ratingFilter) {
        reviews = reviews.filter(r => r.rating === parseInt(ratingFilter));
    }

    if (searchTerm) {
        reviews = reviews.filter(r => r.comment.toLowerCase().includes(searchTerm));
    }

    return reviews.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

function filterReviews() {
    loadReviews();
}

function loadInventory() {
    const inventoryList = document.getElementById('inventoryList');
    inventoryList.innerHTML = '';

    let totalProducts = mockData.products.length;
    let lowStock = 0;
    let outOfStock = 0;

    mockData.products.forEach(product => {
        const status = getStockStatus(product.stock);
        if (status === 'low-stock') lowStock++;
        if (status === 'out-of-stock') outOfStock++;

        const inventoryItem = document.createElement('div');
        inventoryItem.className = 'inventory-item';
        inventoryItem.innerHTML = `
            <div class="inventory-info">
                <h3>${product.name}</h3>
                <p>${product.description}</p>
            </div>
            <div class="inventory-stat">
                <label>Current Stock</label>
                <div class="value">${product.stock}</div>
            </div>
            <div class="inventory-stat">
                <label>Price</label>
                <div class="value" style="color:#27ae60;">₹${product.price}</div>
            </div>
            <div class="inventory-stat">
                <div class="stock-status ${status}">${status.replace('-', ' ').toUpperCase()}</div>
            </div>
        `;
        inventoryList.appendChild(inventoryItem);
    });

    document.getElementById('totalProducts').textContent = totalProducts;
    document.getElementById('lowStock').textContent = lowStock;
    document.getElementById('outOfStock').textContent = outOfStock;
}

function getStockStatus(stock) {
    if (stock === 0) return 'out-of-stock';
    if (stock < 10) return 'low-stock';
    return 'in-stock';
}

function loadProductOptions() {
    const select = document.getElementById('inventoryProduct');
    select.innerHTML = '';
    
    mockData.products.forEach(product => {
        const option = document.createElement('option');
        option.value = product.id;
        option.textContent = `${product.name} (Current: ${product.stock})`;
        select.appendChild(option);
    });
}

function handleInventorySubmit(e) {
    e.preventDefault();
    
    const productId = parseInt(document.getElementById('inventoryProduct').value);
    const changeType = document.getElementById('inventoryChangeType').value;
    const quantity = parseInt(document.getElementById('inventoryQuantity').value);
    const notes = document.getElementById('inventoryNotes').value.trim();

    const newLog = {
        id: mockData.inventory_logs.length + 1,
        product_id: productId,
        change_type: changeType,
        quantity_change: changeType === 'stock_out' ? -quantity : quantity,
        notes,
        created_at: new Date().toISOString().split('T')[0]
    };

    mockData.inventory_logs.push(newLog);

    // Update product stock
    const product = mockData.products.find(p => p.id === productId);
    if (product) {
        product.stock += newLog.quantity_change;
    }

    hideModal(inventoryModal);
    inventoryForm.reset();
    loadInventory();
}

function loadOrders() {
    const ordersList = document.getElementById('ordersList');
    ordersList.innerHTML = '';

    mockData.orders.forEach(order => {
        const buyer = mockData.users.find(u => u.id === order.buyer_id);
        const product = mockData.products.find(p => p.id === order.product_id);

        const orderCard = document.createElement('div');
        orderCard.className = 'order-card';
        orderCard.innerHTML = `
            <div class="order-id">Order #${order.id}</div>
            <div class="order-details">
                <h4>${product.name}</h4>
                <p>Buyer: ${buyer.username}</p>
                <p>Quantity: ${order.quantity}</p>
                <p>Date: ${order.order_date}</p>
            </div>
            <div class="order-price">₹${order.total_price.toFixed(2)}</div>
            <button class="primary-btn" onclick="viewOrderDetails(${order.id})">View Details</button>
        `;
        ordersList.appendChild(orderCard);
    });
}

function viewOrderDetails(orderId) {
    const order = mockData.orders.find(o => o.id === orderId);
    const review = mockData.reviews.find(r => r.order_id === orderId);
    
    if (review) {
        alert(`Order #${orderId}\nReview: ${getStars(review.rating)}\n${review.comment}`);
    } else {
        alert(`Order #${orderId}\nNo review yet.`);
    }
}

function getStars(rating) {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function showModal(modal) {
    modal.classList.add('active');
}

function hideModal(modal) {
    modal.classList.remove('active');
}

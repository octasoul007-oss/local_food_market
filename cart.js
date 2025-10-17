const API_URL = 'http://localhost:3000/api';
let currentUser = null;

document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  loadCart();
  setupEventListeners();
});

function checkAuth() {
  const user = localStorage.getItem('user');
  if (!user) {
    window.location.href = 'login.html';
    return;
  }
  currentUser = JSON.parse(user);
}

function setupEventListeners() {
  document.getElementById('clearCartBtn').addEventListener('click', clearCart);
  document.getElementById('checkoutBtn').addEventListener('click', checkout);
  document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.clear();
    window.location.href = 'login.html';
  });
}

async function loadCart() {
  try {
    const response = await fetch(`${API_URL}/cart/user/${currentUser.id}`);
    const data = await response.json();
    
    displayCart(data.items);
    updateSummary(data.total);
    updateCartCount(data.items.length);
  } catch (error) {
    console.error('Error loading cart:', error);
  }
}

function displayCart(items) {
  const list = document.getElementById('cartItemsList');
  
  if (!items || items.length === 0) {
    list.innerHTML = `
      <div class="empty-cart">
        <div class="empty-cart-icon">🛒</div>
        <h3>Your cart is empty</h3>
        <p>Add some products to get started!</p>
        <a href="index.html" class="btn btn-primary" style="margin-top: 1rem; display: inline-block;">Browse Products</a>
      </div>
    `;
    document.getElementById('checkoutBtn').disabled = true;
    return;
  }
  
  list.innerHTML = '';
  items.forEach(item => {
    const div = document.createElement('div');
    div.className = 'cart-item';
    div.innerHTML = `
      <img src="${item.image || 'placeholder.jpg'}" alt="${item.name}" class="item-image">
      <div class="item-details">
        <div class="item-name">${item.name}</div>
        <div class="item-farmer">Sold by: ${item.farmer_name}</div>
        <div class="item-price">₹${item.price}/${item.unit}</div>
      </div>
      <div class="item-actions">
        <div class="quantity-controls">
          <button class="quantity-btn" onclick="updateQuantity(${item.id}, ${item.quantity - 1})">-</button>
          <span class="quantity-display">${item.quantity}</span>
          <button class="quantity-btn" onclick="updateQuantity(${item.id}, ${item.quantity + 1})">+</button>
        </div>
        <button class="remove-btn" onclick="removeItem(${item.id})">Remove</button>
        <div style="font-weight: 600; color: #2c3e50;">₹${(item.price * item.quantity).toFixed(2)}</div>
      </div>
    `;
    list.appendChild(div);
  });
}

function updateSummary(subtotal) {
  const deliveryFee = 50;
  const total = subtotal + deliveryFee;
  
  document.getElementById('subtotal').textContent = `₹${subtotal.toFixed(2)}`;
  document.getElementById('deliveryFee').textContent = `₹${deliveryFee.toFixed(2)}`;
  document.getElementById('total').textContent = `₹${total.toFixed(2)}`;
}

function updateCartCount(count) {
  document.getElementById('cartCount').textContent = count;
}

async function updateQuantity(cartItemId, newQuantity) {
  if (newQuantity < 1) {
    removeItem(cartItemId);
    return;
  }
  
  try {
    const response = await fetch(`${API_URL}/cart/${cartItemId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity: newQuantity })
    });
    
    if (response.ok) {
      loadCart();
    }
  } catch (error) {
    console.error('Error updating quantity:', error);
  }
}

async function removeItem(cartItemId) {
  if (!confirm('Remove this item from cart?')) return;
  
  try {
    const response = await fetch(`${API_URL}/cart/${cartItemId}`, {
      method: 'DELETE'
    });
    
    if (response.ok) {
      loadCart();
    }
  } catch (error) {
    console.error('Error removing item:', error);
  }
}

async function clearCart() {
  if (!confirm('Clear all items from cart?')) return;
  
  try {
    const response = await fetch(`${API_URL}/cart/user/${currentUser.id}/clear`, {
      method: 'DELETE'
    });
    
    if (response.ok) {
      alert('✅ Cart cleared');
      loadCart();
    }
  } catch (error) {
    console.error('Error clearing cart:', error);
  }
}

function checkout() {
  alert('Checkout functionality coming soon!');
  // TODO: Implement order creation
}

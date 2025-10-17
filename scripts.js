// script.js - Client-side shopping cart functionality

// Initialize cart from localStorage
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Update cart count on page load
document.addEventListener('DOMContentLoaded', function() {
    updateCartCount();
    
    // Add event listeners to all "Add to Cart" buttons
    const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function() {
            const productCard = this.closest('.product-card');
            const productName = productCard.querySelector('.product-name').textContent;
            const productPrice = productCard.querySelector('.product-price').textContent.replace('₹', '').replace('/kg', '');
            const farmer = productCard.querySelector('.product-farmer').textContent.replace('👨‍🌾 Farmer: ', '');
            const category = productCard.querySelector('.product-category').textContent.replace('🥕 Category: ', '');
            
            addToCart(productName, productPrice, farmer, category);
        });
    });
});

// Add product to cart
function addToCart(productName, price, farmer, category, image = '') {
    const existingProduct = cart.find(item => item.name === productName);
    
    if (existingProduct) {
        existingProduct.quantity += 1;
        showNotification('Product quantity updated in cart!');
    } else {
        const product = {
            id: Date.now(), // Unique ID
            name: productName,
            price: parseFloat(price),
            farmer: farmer,
            category: category,
            image: image,
            quantity: 1
        };
        cart.push(product);
        showNotification('Product added to cart!');
    }
    
    // Save to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    
    // If using server-side cart, send to backend
    syncCartWithServer();
}

// Update cart count in navigation
function updateCartCount() {
    const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
    const cartLink = document.querySelector('a[href="cart.html"]');
    
    if (cartLink) {
        if (cartCount > 0) {
            cartLink.textContent = Cart (${cartCount});
        } else {
            cartLink.textContent = 'Cart';
        }
    }
}

// Show notification (optional)
function showNotification(message) {
    // Simple alert - you can replace with a better notification system
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        z-index: 9999;
        animation: slideIn 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Sync cart with server (if you're using backend)
async function syncCartWithServer() {
    try {
        const response = await fetch('http://localhost:3000/api/cart/sync', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ cart: cart })
        });
        
        if (!response.ok) {
            console.error('Failed to sync cart with server');
        }
    } catch (error) {
        console.error('Error syncing cart:', error);
    }
}

// Get cart from server
async function getCartFromServer() {
    try {
        const response = await fetch('http://localhost:3000/api/cart');
        if (response.ok) {
            const data = await response.json();
            cart = data.cart || [];
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartCount();
        }
    } catch (error) {
        console.error('Error fetching cart:', error);
    }
}

// Remove item from cart
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    syncCartWithServer();
}

// Update quantity
function updateQuantity(productId, newQuantity) {
    const product = cart.find(item => item.id === productId);
    if (product) {
        if (newQuantity <= 0) {
            removeFromCart(productId);
        } else {
            product.quantity = newQuantity;
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartCount();
            syncCartWithServer();
        }
    }
}

// Clear entire cart
function clearCart() {
    cart = [];
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    syncCartWithServer();
}

// Get cart total
function getCartTotal() {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2);
}
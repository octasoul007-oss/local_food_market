const API_URL = 'http://localhost:3000/api';
let currentUser = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  loadAvailability();
  setupEventListeners();
});

function checkAuth() {
  const user = localStorage.getItem('user');
  if (!user) {
    window.location.href = 'login.html';
    return;
  }
  currentUser = JSON.parse(user);
  
  if (currentUser.user_type === 'farmer') {
    document.getElementById('addAvailabilityBtn').style.display = 'block';
    loadFarmerProducts();
  }
}

function setupEventListeners() {
  const modal = document.getElementById('availabilityModal');
  const addBtn = document.getElementById('addAvailabilityBtn');
  const closeBtn = document.querySelector('.close');
  
  if (addBtn) {
    addBtn.onclick = () => modal.style.display = 'block';
  }
  
  if (closeBtn) {
    closeBtn.onclick = () => modal.style.display = 'none';
  }
  
  window.onclick = (e) => {
    if (e.target === modal) modal.style.display = 'none';
  };
  
  document.getElementById('availabilityForm').addEventListener('submit', handleAddAvailability);
  document.getElementById('filterBtn').addEventListener('click', filterAvailability);
  document.getElementById('clearFilterBtn').addEventListener('click', () => {
    document.getElementById('startDate').value = '';
    document.getElementById('endDate').value = '';
    loadAvailability();
  });
  
  document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.clear();
    window.location.href = 'login.html';
  });
}

async function loadFarmerProducts() {
  try {
    const response = await fetch(`${API_URL}/products/farmer/${currentUser.id}`);
    const products = await response.json();
    
    const select = document.getElementById('productSelect');
    products.forEach(product => {
      const option = document.createElement('option');
      option.value = product.id;
      option.textContent = `${product.name} (${product.price}/${product.unit})`;
      select.appendChild(option);
    });
  } catch (error) {
    console.error('Error loading products:', error);
  }
}

async function loadAvailability() {
  try {
    const farmerId = currentUser.user_type === 'farmer' ? currentUser.id : null;
    const url = farmerId 
      ? `${API_URL}/calendar/farmer/${farmerId}/upcoming`
      : `${API_URL}/calendar/upcoming`;
    
    const response = await fetch(url);
    const availability = await response.json();
    
    displayAvailability(availability);
  } catch (error) {
    console.error('Error loading availability:', error);
  }
}

function displayAvailability(availability) {
  const list = document.getElementById('availabilityList');
  list.innerHTML = '';
  
  if (availability.length === 0) {
    list.innerHTML = '<p style="text-align:center;color:#7f8c8d;">No availability scheduled</p>';
    return;
  }
  
  availability.forEach(item => {
    const date = new Date(item.available_date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    const div = document.createElement('div');
    div.className = 'availability-item';
    div.innerHTML = `
      <div class="availability-item-header">
        <span class="availability-date">${date}</span>
        ${currentUser.user_type === 'farmer' ? `<button class="btn btn-small" onclick="deleteAvailability(${item.id})">Delete</button>` : ''}
      </div>
      <div class="availability-product">${item.product_name || 'General Availability'}</div>
      <div class="availability-details">
        ${item.quantity ? `Quantity: ${item.quantity} ${item.unit || ''}` : ''}
        ${item.notes ? `<br>Notes: ${item.notes}` : ''}
      </div>
    `;
    list.appendChild(div);
  });
}

async function handleAddAvailability(e) {
  e.preventDefault();
  
  const availabilityData = {
    farmer_id: currentUser.id,
    product_id: document.getElementById('productSelect').value || null,
    available_date: document.getElementById('availableDate').value,
    quantity: document.getElementById('availableQuantity').value || null,
    notes: document.getElementById('availableNotes').value || null
  };
  
  try {
    const response = await fetch(`${API_URL}/calendar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(availabilityData)
    });
    
    if (response.ok) {
      alert('✅ Availability added successfully!');
      document.getElementById('availabilityModal').style.display = 'none';
      document.getElementById('availabilityForm').reset();
      loadAvailability();
    } else {
      const data = await response.json();
      alert('❌ Error: ' + (data.error || 'Failed to add availability'));
    }
  } catch (error) {
    alert('❌ Network error: ' + error.message);
  }
}

async function deleteAvailability(id) {
  if (!confirm('Are you sure you want to delete this availability?')) return;
  
  try {
    const response = await fetch(`${API_URL}/calendar/${id}`, {
      method: 'DELETE'
    });
    
    if (response.ok) {
      alert('✅ Availability deleted');
      loadAvailability();
    } else {
      alert('❌ Failed to delete availability');
    }
  } catch (error) {
    alert('❌ Error: ' + error.message);
  }
}

async function filterAvailability() {
  const startDate = document.getElementById('startDate').value;
  const endDate = document.getElementById('endDate').value;
  
  if (!startDate || !endDate) {
    alert('Please select both start and end dates');
    return;
  }
  
  try {
    const url = `${API_URL}/calendar/farmer/${currentUser.id}?startDate=${startDate}&endDate=${endDate}`;
    const response = await fetch(url);
    const availability = await response.json();
    displayAvailability(availability);
  } catch (error) {
    console.error('Error filtering:', error);
  }
}

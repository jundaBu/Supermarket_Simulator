const cart = {};

// In-memory database for transactions
const transactions = [];
let transactionCounter = 1;

// Pagination state
let currentPage = 1;
const totalPages = 6;
let itemListenersAttached = false;

function updateCartCount() {
    const count = Object.values(cart).reduce((a, b) => a + b, 0);
    document.getElementById('cart-count').textContent = count;
    // Enable/disable checkout button based on cart content
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.disabled = count === 0;
    }
}

function updatePagination() {
    const prevBtn = document.getElementById('prev-page');
    const nextBtn = document.getElementById('next-page');
    const pageInfo = document.getElementById('page-info');
    
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages;
    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
    
    // Hide all pages
    document.querySelectorAll('.page-content').forEach(page => {
        page.classList.remove('active');
    });
    
    // Show current page
    const currentPageElement = document.querySelector(`[data-page="${currentPage}"]`);
    if (currentPageElement) {
        currentPageElement.classList.add('active');
    }
    
    // Initialize item event listeners once
    if (!itemListenersAttached) {
        attachItemEventListeners();
        itemListenersAttached = true;
    }
}

function attachItemEventListeners() {
    // Use event delegation - attach one listener to the items container
    const itemsContainer = document.querySelector('.items-container');
    
    itemsContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('.item-btn');
        if (!btn) return;
        
        const item = btn.getAttribute('data-item');
        cart[item] = (cart[item] || 0) + 1;
        updateCartCount();
        showNotification(`${item} successfully added to cart`);
        
        // Add bounce animation
        btn.classList.remove('bounce');
        void btn.offsetWidth; // force reflow for retrigger
        btn.classList.add('bounce');
        setTimeout(() => btn.classList.remove('bounce'), 500);

        // Fly emoji animation
        const emojiElem = btn.querySelector('.item-emoji');
        flyEmojiToCart(emojiElem, btn);
    });
}

function updateCartModal() {
    const cartItems = document.getElementById('cart-items');
    cartItems.innerHTML = '';
    const checkoutBtn = document.getElementById('checkout-btn');
    if (Object.keys(cart).length === 0) {
        cartItems.innerHTML = '<li>Your cart is empty.</li>';
        if (checkoutBtn) checkoutBtn.disabled = true;
        return;
    }
    if (checkoutBtn) checkoutBtn.disabled = false;
    for (const [item, qty] of Object.entries(cart)) {
        const li = document.createElement('li');
        li.textContent = `${item} x${qty} `;
        // Create minus button
        const minusBtn = document.createElement('button');
        minusBtn.textContent = '−';
        minusBtn.className = 'minus-btn';
        minusBtn.style.marginLeft = '10px';
        minusBtn.style.background = '#f44336';
        minusBtn.style.color = '#fff';
        minusBtn.style.border = 'none';
        minusBtn.style.borderRadius = '50%';
        minusBtn.style.width = '28px';
        minusBtn.style.height = '28px';
        minusBtn.style.cursor = 'pointer';
        minusBtn.style.fontSize = '1.2em';
        minusBtn.addEventListener('click', () => {
            if (cart[item] > 1) {
                cart[item] -= 1;
            } else {
                delete cart[item];
            }
            updateCartCount();
            updateCartModal();
        });
        li.appendChild(minusBtn);
        cartItems.appendChild(li);
    }
}

function showNotification(message) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.classList.remove('hidden');
    clearTimeout(showNotification.timeout);
    showNotification.timeout = setTimeout(() => {
        notification.classList.add('hidden');
    }, 1800);
}

function flyEmojiToCart(emojiElem, btn) {
    const cartBtn = document.getElementById('cart-btn');
    if (!cartBtn || !emojiElem) return;

    // Get bounding rectangles
    const emojiRect = emojiElem.getBoundingClientRect();
    const cartRect = cartBtn.getBoundingClientRect();

    // Create a clone for animation
    const flying = emojiElem.cloneNode(true);
    flying.classList.add('flying-emoji');
    
    // Set initial position (absolute positioning relative to page)
    const startX = emojiRect.left + window.scrollX;
    const startY = emojiRect.top + window.scrollY;
    
    flying.style.left = startX + 'px';
    flying.style.top = startY + 'px';
    flying.style.position = 'absolute';
    flying.style.zIndex = '3000';
    flying.style.pointerEvents = 'none';
    
    document.body.appendChild(flying);

    // Calculate destination (center of cart button, absolute positioning)
    const endX = cartRect.left + window.scrollX + (cartRect.width / 2) - (emojiRect.width / 2);
    const endY = cartRect.top + window.scrollY + (cartRect.height / 2) - (emojiRect.height / 2);
    
    // Calculate the movement needed
    const deltaX = endX - startX;
    const deltaY = endY - startY;

    console.log('Flying emoji from:', startX, startY, 'to:', endX, endY, 'delta:', deltaX, deltaY);

    // Simple, reliable animation with better timing
    flying.animate([
        {
            transform: 'translate(0, 0) scale(1)',
            opacity: 1
        },
        {
            // Stay visible most of the way
            offset: 0.85,
            transform: `translate(${deltaX}px, ${deltaY}px) scale(0.3)`,
            opacity: 1
        },
        {
            // Quick fade at the very end
            transform: `translate(${deltaX}px, ${deltaY}px) scale(0.3)`,
            opacity: 0
        }
    ], {
        duration: 1800,
        easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        fill: 'forwards'
    });

    // Remove after animation
    setTimeout(() => {
        if (flying && flying.parentNode) {
            flying.remove();
        }
    }, 1800);
}

// Pagination event listeners
const prevPageBtn = document.getElementById('prev-page');
const nextPageBtn = document.getElementById('next-page');

prevPageBtn.addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        updatePagination();
    }
});

nextPageBtn.addEventListener('click', () => {
    if (currentPage < totalPages) {
        currentPage++;
        updatePagination();
    }
});

// Initial setup
document.addEventListener('DOMContentLoaded', () => {
    updatePagination();
    updateCartCount();
});

// Initial setup
document.addEventListener('DOMContentLoaded', () => {
    updatePagination();
    updateCartCount();
});

// Cart and database modal logic
const cartBtn = document.getElementById('cart-btn');
const cartModal = document.getElementById('cart-modal');
const closeCartBtn = document.getElementById('close-cart-btn');
const checkoutBtn = document.getElementById('checkout-btn');

cartBtn.addEventListener('click', () => {
    updateCartModal();
    cartModal.classList.remove('hidden');
});

closeCartBtn.addEventListener('click', () => {
    cartModal.classList.add('hidden');
});

checkoutBtn.addEventListener('click', () => {
    // Prepare transaction data
    const itemsPurchased = Object.entries(cart).map(([item, qty]) => ({ item, qty }));
    const totalItems = Object.values(cart).reduce((a, b) => a + b, 0);

    if (totalItems > 0) {
        transactions.push({
            transactionNumber: transactionCounter++,
            items: itemsPurchased,
            totalItems: totalItems
        });
    }

    for (const key in cart) delete cart[key];
    updateCartCount();
    updateCartModal();
    cartModal.classList.add('hidden');
});

// Database modal logic
const databaseBtn = document.getElementById('database-btn');
const databaseModal = document.getElementById('database-modal');
const closeDatabaseBtn = document.getElementById('close-database-btn');

function renderDatabaseTable() {
    const tbody = document.querySelector('#database-table tbody');
    tbody.innerHTML = '';
    if (transactions.length === 0) {
        const tr = document.createElement('tr');
        const td = document.createElement('td');
        td.colSpan = 3;
        td.textContent = 'No transactions yet.';
        tr.appendChild(td);
        tbody.appendChild(tr);
        return;
    }
    transactions.forEach(tx => {
        const tr = document.createElement('tr');
        // Transaction number
        const tdNum = document.createElement('td');
        tdNum.textContent = tx.transactionNumber;
        tr.appendChild(tdNum);
        // Items purchased
        const tdItems = document.createElement('td');
        tdItems.textContent = tx.items.map(i => `${i.item} x${i.qty}`).join(', ');
        tr.appendChild(tdItems);
        // Total items
        const tdTotal = document.createElement('td');
        tdTotal.textContent = tx.totalItems;
        tr.appendChild(tdTotal);
        tbody.appendChild(tr);
    });
}

databaseBtn.addEventListener('click', () => {
    renderDatabaseTable();
    databaseModal.classList.remove('hidden');
});

closeDatabaseBtn.addEventListener('click', () => {
    databaseModal.classList.add('hidden');
});

// Optional: For debugging, you can log transactions to the console
// window.transactions = transactions;
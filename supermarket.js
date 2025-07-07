const cart = {};

// In-memory database for transactions
const transactions = [];
let transactionCounter = 1;

function updateCartCount() {
    const count = Object.values(cart).reduce((a, b) => a + b, 0);
    document.getElementById('cart-count').textContent = count;
    // Enable/disable checkout button based on cart content
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.disabled = count === 0;
    }
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
    document.body.appendChild(flying);

    // Set initial position
    flying.style.left = emojiRect.left + window.scrollX + 'px';
    flying.style.top = emojiRect.top + window.scrollY + 'px';

    // Calculate destination (center of cart button)
    const destX = cartRect.left + cartRect.width / 2 - emojiRect.left - emojiRect.width / 2;
    const destY = cartRect.top + cartRect.height / 2 - emojiRect.top - emojiRect.height / 2;

    // Set the main movement as a transform inline for the animation
    flying.style.setProperty('--fly-x', `${destX}px`);
    flying.style.setProperty('--fly-y', `${destY}px`);

    // Animate using JS-driven keyframes
    flying.animate([
        {
            transform: 'translate(0, 0) scale(1)',
            opacity: 1
        },
        {
            // Move to cart
            offset: 0.7,
            transform: `translate(${destX}px, ${destY}px) scale(0.5)`,
            opacity: 0.7
        },
        {
            // Go up
            offset: 0.75,
            transform: `translate(${destX}px, ${destY - 40}px) scale(0.5)`,
            opacity: 1
        },
        {
            // Fall down into the button
            offset: 0.85,
            transform: `translate(${destX}px, ${destY}px) scale(0.5)`,
            opacity: 1
        },
        {
            // Fade out
            offset: 1,
            transform: `translate(${destX}px, ${destY}px) scale(0.5)`,
            opacity: 0
        }
    ], {
        duration: 2200,
        easing: 'cubic-bezier(.4,2,.6,1)',
        fill: 'forwards'
    });

    // Remove after animation
    setTimeout(() => {
        flying.remove();
    }, 2200);
}

document.querySelectorAll('.item-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const item = btn.getAttribute('data-item');
        cart[item] = (cart[item] || 0) + 1;
        updateCartCount();
        showNotification(`${item} successfully added to cart`);
        // Add bounce animation
        btn.classList.remove('bounce'); // reset if needed
        void btn.offsetWidth; // force reflow for retrigger
        btn.classList.add('bounce');
        setTimeout(() => btn.classList.remove('bounce'), 500);

        // Fly emoji animation
        const emojiElem = btn.querySelector('.item-emoji');
        flyEmojiToCart(emojiElem, btn);
    });
});

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
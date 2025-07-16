const cart = {};

// In-memory database for transactions
const transactions = [];
let transactionCounter = 1;

// Cache for clustering analysis
let cachedAnalysis = null;
let lastAnalysisTransactionCount = 0;

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
        
        // Invalidate cached analysis when new transaction is added
        cachedAnalysis = null;
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
const fillDatabaseBtn = document.getElementById('fill-database-btn');

databaseBtn.addEventListener('click', () => {
    renderDatabaseTable();
    databaseModal.classList.remove('hidden');
});

fillDatabaseBtn.addEventListener('click', () => {
    fillDatabaseWithRandomTransactions();
});

closeDatabaseBtn.addEventListener('click', () => {
    databaseModal.classList.add('hidden');
});

// K-means clustering implementation
class KMeansClusterer {
    constructor(k = 3) {
        this.k = k;
        this.centroids = [];
        this.clusters = [];
    }

    // Convert transaction data to feature vectors
    prepareData(transactions) {
        // Get all unique items across all transactions
        const allItems = new Set();
        transactions.forEach(tx => {
            tx.items.forEach(item => allItems.add(item.item));
        });
        const itemList = Array.from(allItems).sort();
        
        // Create feature vectors (each transaction becomes a vector)
        return transactions.map(tx => {
            const vector = new Array(itemList.length).fill(0);
            tx.items.forEach(item => {
                const index = itemList.indexOf(item.item);
                if (index !== -1) {
                    vector[index] = item.qty;
                }
            });
            return { vector, transaction: tx, itemList };
        });
    }

    // Calculate Euclidean distance between two points
    distance(point1, point2) {
        if (point1.length !== point2.length) return Infinity;
        return Math.sqrt(
            point1.reduce((sum, val, i) => sum + Math.pow(val - point2[i], 2), 0)
        );
    }

    // Initialize centroids with improved K-means++ inspired seeding
    initializeCentroids(data) {
        this.centroids = [];
        const numFeatures = data[0].vector.length;
        
        if (data.length === 0) return;
        
        // First centroid: choose a random data point
        const firstCentroid = [...data[Math.floor(Math.random() * data.length)].vector];
        this.centroids.push(firstCentroid);
        
        // Remaining centroids: choose points far from existing centroids
        for (let i = 1; i < this.k; i++) {
            const distances = data.map(point => {
                // Find minimum distance to any existing centroid
                let minDistToCenter = Infinity;
                this.centroids.forEach(centroid => {
                    const dist = this.distance(point.vector, centroid);
                    minDistToCenter = Math.min(minDistToCenter, dist);
                });
                return minDistToCenter;
            });
            
            // Choose point with maximum distance to nearest centroid
            const maxDistIndex = distances.indexOf(Math.max(...distances));
            this.centroids.push([...data[maxDistIndex].vector]);
        }
        
        // Add some small random variation to prevent identical centroids
        this.centroids.forEach(centroid => {
            centroid.forEach((val, j) => {
                if (val > 0) {
                    centroid[j] += (Math.random() - 0.5) * 0.1;
                }
            });
        });
    }

    // Assign each point to the nearest centroid
    assignToClusters(data) {
        this.clusters = Array(this.k).fill().map(() => []);
        
        data.forEach(point => {
            let minDistance = Infinity;
            let closestCluster = 0;
            
            this.centroids.forEach((centroid, i) => {
                const dist = this.distance(point.vector, centroid);
                if (dist < minDistance) {
                    minDistance = dist;
                    closestCluster = i;
                }
            });
            
            this.clusters[closestCluster].push(point);
        });
    }

    // Update centroids to the mean of their clusters
    updateCentroids() {
        this.centroids = this.clusters.map((cluster, clusterIndex) => {
            if (cluster.length === 0) {
                // Keep the old centroid if cluster is empty
                return [...this.centroids[clusterIndex]];
            }
            
            const dimensions = cluster[0].vector.length;
            const newCentroid = new Array(dimensions).fill(0);
            
            // Calculate mean for each dimension
            cluster.forEach(point => {
                point.vector.forEach((val, i) => {
                    newCentroid[i] += val;
                });
            });
            
            return newCentroid.map(sum => sum / cluster.length);
        });
    }

    // Main clustering algorithm with improved validation
    cluster(transactions, maxIterations = 100) {
        console.log(`Starting K-means clustering with ${this.k} clusters for ${transactions.length} transactions`);
        
        if (transactions.length < this.k) {
            return { 
                success: false, 
                error: `Need at least ${this.k} transactions for clustering. Currently have ${transactions.length}.` 
            };
        }

        const data = this.prepareData(transactions);
        if (data.length === 0 || data[0].vector.length === 0) {
            return { 
                success: false, 
                error: "No valid transaction data found for clustering." 
            };
        }

        console.log(`Prepared ${data.length} data points with ${data[0].vector.length} features`);
        
        this.initializeCentroids(data);
        console.log('Initialized centroids');
        
        let iteration = 0;
        for (iteration = 0; iteration < maxIterations; iteration++) {
            const oldCentroids = this.centroids.map(c => [...c]);
            
            this.assignToClusters(data);
            
            // Check for empty clusters
            const emptyClusters = this.clusters.filter(cluster => cluster.length === 0).length;
            if (emptyClusters > 0) {
                console.log(`Warning: ${emptyClusters} empty clusters at iteration ${iteration + 1}`);
            }
            
            this.updateCentroids();
            
            // Check for convergence
            const converged = this.centroids.every((centroid, i) => 
                this.distance(centroid, oldCentroids[i]) < 0.001
            );
            
            if (converged) {
                console.log(`Converged after ${iteration + 1} iterations`);
                break;
            }
        }
        
        // Log final cluster sizes
        const clusterSizes = this.clusters.map(cluster => cluster.length);
        console.log(`Final cluster sizes: [${clusterSizes.join(', ')}]`);
        
        return {
            success: true,
            clusters: this.clusters,
            centroids: this.centroids,
            itemList: data[0]?.itemList || [],
            iterations: iteration + 1
        };
    }
}

// Helper function to categorize items for better cluster descriptions
function categorizeItems(items) {
    const categories = {
        'Food': ['Apple', 'Banana', 'Orange', 'Strawberry', 'Grapes', 'Watermelon', 'Tomato', 'Lettuce', 'Carrot', 'Broccoli', 'Potato', 'Onion', 'Milk', 'Eggs', 'Cheese', 'Butter', 'Ice Cream', 'Chicken', 'Beef', 'Pork', 'Fish', 'Shrimp', 'Ham', 'Sausage', 'Bread', 'Rice', 'Pasta', 'Cereal', 'Crackers', 'Cookies', 'Chips', 'Nuts', 'Chocolate', 'Coffee', 'Tea', 'Juice'],
        'Clothing': ['T-Shirt', 'Jeans', 'Dress', 'Jacket', 'Sweater', 'Shoes', 'Boots', 'Sandals', 'Hat', 'Socks', 'Underwear', 'Scarf'],
        'Electronics': ['Watch', 'Phone', 'Laptop', 'Computer', 'Camera', 'TV', 'Flashlight', 'Printer', 'PS5', 'Radio', 'Clock', 'Microphone'],
        'Sports': ['Soccer Ball', 'Basketball', 'Tennis Ball', 'Tennis Racket', 'Baseball', 'Baseball Bat', 'Golf Ball', 'Yoga Mat', 'Dumbbells', 'Swimming Goggles', 'Bicycle Helmet', 'Running Shoes']
    };
    
    const categoryCounts = {};
    items.forEach(item => {
        for (const [category, categoryItems] of Object.entries(categories)) {
            if (categoryItems.includes(item)) {
                categoryCounts[category] = (categoryCounts[category] || 0) + 1;
                break;
            }
        }
    });
    
    return Object.entries(categoryCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 2)
        .map(([category]) => category);
}

// Analyze customer behavior using k-means clustering
function analyzeCustomerBehavior() {
    if (transactions.length < 5) {
        showNotification("Need at least 5 transactions for meaningful clustering analysis");
        return;
    }

    // Check if we have cached analysis for current transaction count
    if (cachedAnalysis && lastAnalysisTransactionCount === transactions.length) {
        showClusteringResults(cachedAnalysis);
        return;
    }

    const clusterer = new KMeansClusterer(5); // Create 5 customer segments
    const result = clusterer.cluster(transactions);
    
    if (!result.success) {
        showNotification(result.error);
        return;
    }

    // Cache the results
    cachedAnalysis = result;
    lastAnalysisTransactionCount = transactions.length;

    // Display results in the analytics modal
    showClusteringResults(result);
}

// Display clustering results in a user-friendly format
function showClusteringResults(result) {
    const modal = document.getElementById('analytics-modal');
    const contentDiv = document.getElementById('analytics-content');
    
    const analysisStatus = cachedAnalysis && lastAnalysisTransactionCount === transactions.length 
        ? `<span style="color: #4caf50;">📊 Current Analysis</span>` 
        : `<span style="color: #ff9800;">🔄 Analysis Updated</span>`;
    
    let html = `<div class="analytics-summary">
        <p><strong>Analysis Complete!</strong> Found ${result.clusters.length} customer segments from ${transactions.length} transactions.</p>
        <p><em>Converged in ${result.iterations} iterations</em> • ${analysisStatus}</p>
        <p style="font-size: 0.9em; color: #666;"><em>Analysis will update when new transactions are added through checkout.</em></p>
    </div>`;
    
    // Available cluster names pool
    const availableNames = [
        "🛍️ Bulk Shoppers",
        "🥗 Health-Conscious Buyers", 
        "🏃‍♂️ Quick Shoppers",
        "👨‍👩‍👧‍👦 Family Shoppers",
        "🎯 Specialty Buyers",
        "🛒 Regular Shoppers",
        "💰 Budget Shoppers",
        "🏪 Convenience Shoppers",
        "🥘 Meal Planners",
        "🎉 Occasional Shoppers"
    ];
    
    // Track used names to prevent duplicates
    const usedNames = new Set();
    let nameIndex = 0;
    
    result.clusters.forEach((cluster, i) => {
        if (cluster.length === 0) return;
        
        // Calculate cluster statistics
        const itemCounts = {};
        let totalQuantity = 0;
        
        cluster.forEach(point => {
            point.transaction.items.forEach(item => {
                itemCounts[item.item] = (itemCounts[item.item] || 0) + item.qty;
                totalQuantity += item.qty;
            });
        });
        
        // Sort items by popularity in this cluster
        const topItems = Object.entries(itemCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 8); // Show top 8 items
        
        const avgTransactionSize = (totalQuantity / cluster.length).toFixed(1);
        
        // Get unique cluster name with smart categorization
        let clusterName;
        if (nameIndex < availableNames.length) {
            clusterName = availableNames[nameIndex];
        } else {
            clusterName = `Customer Segment ${nameIndex + 1}`;
        }
        
        // Add smart cluster description based on top items
        let clusterDescription = '';
        if (topItems.length > 0) {
            const topCategories = categorizeItems(topItems.map(([item]) => item));
            if (topCategories.length > 0) {
                clusterDescription = ` - Focus on ${topCategories.join(', ')}`;
            }
        }
        
        nameIndex++;
        
        html += `<div class="cluster-group">
            <h4>${clusterName}${clusterDescription}
                <span style="font-weight: normal; color: #666;">(${cluster.length} transactions)</span>
            </h4>
            
            <div class="cluster-stats">
                <strong>Average items per transaction:</strong> ${avgTransactionSize}
                <br><strong>Total items in cluster:</strong> ${totalQuantity}
                <br><strong>Cluster diversity:</strong> ${Object.keys(itemCounts).length} different items
            </div>
            
            <h5 style="margin: 12px 0 8px 0; color: #7b1fa2;">Most Popular Items:</h5>
            <ul class="cluster-items">`;
        
        topItems.forEach(([item, count]) => {
            const percentage = ((count / totalQuantity) * 100).toFixed(1);
            html += `<li>
                <span>${item}</span>
                <span class="item-count">${count} units (${percentage}%)</span>
            </li>`;
        });
        
        html += '</ul></div>';
    });
    
    if (result.clusters.every(cluster => cluster.length === 0)) {
        html = '<div class="no-data-message">No meaningful clusters could be formed from the current data.</div>';
    }
    
    contentDiv.innerHTML = html;
    modal.classList.remove('hidden');
}

// Analytics modal event listeners
const analyticsBtn = document.getElementById('analytics-btn');
const analyticsModal = document.getElementById('analytics-modal');
const closeAnalyticsBtn = document.getElementById('close-analytics-btn');

analyticsBtn.addEventListener('click', () => {
    analyzeCustomerBehavior();
});

closeAnalyticsBtn.addEventListener('click', () => {
    analyticsModal.classList.add('hidden');
});

// Database modal logic
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

// Fill database with random transactions
function fillDatabaseWithRandomTransactions() {
    // All available items from the supermarket
    const availableItems = [
        // Fruits & Vegetables
        "Apple", "Banana", "Orange", "Strawberry", "Grapes", "Watermelon",
        "Tomato", "Lettuce", "Carrot", "Broccoli", "Potato", "Onion",
        
        // Dairy & Meat
        "Milk", "Eggs", "Cheese", "Butter", "Ice Cream", "Chicken",
        "Beef", "Pork", "Fish", "Shrimp", "Ham", "Sausage",
        
        // Pantry & Snacks
        "Bread", "Rice", "Pasta", "Cereal", "Crackers", "Cookies",
        "Chips", "Nuts", "Chocolate", "Coffee", "Tea", "Juice",
        
        // Clothing
        "T-Shirt", "Jeans", "Dress", "Jacket", "Sweater", "Shoes",
        "Boots", "Sandals", "Hat", "Socks", "Underwear", "Scarf",
        
        // Electronics
        "Watch", "Phone", "Laptop", "Computer", "Camera", "TV",
        "Flashlight", "Printer", "PS5", "Radio", "Clock", "Microphone",
        
        // Sports Equipment
        "Soccer Ball", "Basketball", "Tennis Ball", "Tennis Racket", "Baseball", "Baseball Bat",
        "Golf Ball", "Yoga Mat", "Dumbbells", "Swimming Goggles", "Bicycle Helmet", "Running Shoes"
    ];
    
    // Generate 50 random transactions
    for (let i = 0; i < 50; i++) {
        const itemsPurchased = [];
        let totalItems = 0;
        
        // Each transaction has 1-8 different items
        const numItems = Math.floor(Math.random() * 8) + 1;
        const selectedItems = new Set();
        
        // Select random unique items for this transaction
        while (selectedItems.size < numItems) {
            const randomItem = availableItems[Math.floor(Math.random() * availableItems.length)];
            selectedItems.add(randomItem);
        }
        
        // Assign random quantities to selected items
        selectedItems.forEach(item => {
            const qty = Math.floor(Math.random() * 5) + 1; // 1-5 quantity
            itemsPurchased.push({ item, qty });
            totalItems += qty;
        });
        
        // Add transaction to database
        transactions.push({
            transactionNumber: transactionCounter++,
            items: itemsPurchased,
            totalItems: totalItems
        });
    }
    
    // Invalidate cached analysis since we added new transactions
    cachedAnalysis = null;
    
    // Update the database table display
    renderDatabaseTable();
    
    // Show notification
    showNotification("Successfully added 50 random transactions to the database!");
}

// Optional: For debugging, you can log transactions to the console
// window.transactions = transactions;
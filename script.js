// Function to handle the navigation menu toggle on mobile
document.addEventListener('DOMContentLoaded', () => {
    const menuBtn = document.querySelector('.menu-btn');
    const navbar = document.querySelector('.navbar');

    menuBtn.addEventListener('click', () => {
        navbar.classList.toggle('active');
    });
});

// Main JavaScript for handling products, modals, and cart functionality
document.addEventListener('DOMContentLoaded', () => {
    const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRDl-cw7a6X_kIJh_e6Q_lIllD9_9R_IXPnCCs3HCGMhTHD9OG67rqKT2NGiHmY7hsSyeZ9sM6urutp/pub?gid=0&single=true&output=csv';
    const GITHUB_IMAGE_BASE_URL = 'https://ilmorafashionbd-ux.github.io/My-Shop/images/';

    let allProducts = [];
    let cart = [];

    // Selectors
    const productGrid = document.getElementById('product-grid');
    const productDetailModal = document.getElementById('product-detail-modal');
    const productDetailContainer = document.getElementById('product-detail-container');
    const productModalCloseBtn = document.getElementById('product-modal-close');
    const orderModal = document.getElementById('order-modal');
    const orderForm = document.getElementById('order-form');
    const cartCountTop = document.querySelector('.cart-count');
    const cartCountBottom = document.querySelector('.cart-count-bottom');
    const categoryItems = document.querySelectorAll('.category-item');
    const cartIcons = document.querySelectorAll('.cart-icon, .cart-btn-bottom');
    const notificationModal = document.getElementById('notification-modal');
    const notificationText = document.getElementById('notification-text');

    // --- Core Functions ---

    // Load cart from localStorage
    const loadCart = () => {
        const storedCart = localStorage.getItem('cart');
        if (storedCart) {
            cart = JSON.parse(storedCart);
        }
        updateCartCount();
    };

    // Save cart to localStorage
    const saveCart = () => {
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
    };

    // Show a custom notification/alert
    const showNotification = (message) => {
        notificationText.textContent = message;
        notificationModal.style.display = 'block';
        setTimeout(() => {
            notificationModal.style.display = 'none';
        }, 3000); // Hide after 3 seconds
    };

    // Add product to cart
    const addToCart = (product) => {
        const existingProduct = cart.find(item => item.id === product.id);
        if (existingProduct) {
            existingProduct.quantity += product.quantity;
            showNotification(`${product.name} পণ্যের পরিমাণ বাড়ানো হয়েছে!`);
        } else {
            cart.push(product);
            showNotification(`${product.name} কার্টে যোগ করা হয়েছে!`);
        }
        saveCart();
    };

    // Update cart count on the header and bottom nav
    const updateCartCount = () => {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCountTop.textContent = totalItems;
        cartCountBottom.textContent = totalItems;
    };

    // Render products on the grid
    const displayProducts = (products) => {
        if (!productGrid) return;
        productGrid.innerHTML = '';
        products.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            productCard.dataset.id = product.id;
            const imageUrl = `${GITHUB_IMAGE_BASE_URL}${product.image}`;
            productCard.innerHTML = `
                <img src="${imageUrl}" alt="${product.name}" class="product-image">
                <div class="product-info">
                    <p class="product-category">${product.category}</p>
                    <h3 class="product-title">${product.name}</h3>
                    <p class="product-price">৳${product.price}</p>
                </div>
            `;
            productGrid.appendChild(productCard);
        });

        // Add event listeners for product cards
        document.querySelectorAll('.product-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const productId = card.dataset.id;
                const product = allProducts.find(p => p.id === productId);
                if (product) {
                    showProductDetails(product);
                }
            });
        });
    };

    // Show product details in a modal
    const showProductDetails = (product) => {
        if (!productDetailContainer) return;
        const imageUrl = `${GITHUB_IMAGE_BASE_URL}${product.image}`;
        productDetailContainer.innerHTML = `
            <div class="product-image-panel">
                <img src="${imageUrl}" alt="${product.name}" class="detail-image">
            </div>
            <div class="product-info-panel">
                <h2 class="product-title">${product.name}</h2>
                <div class="price-section">
                    <p class="product-price">৳${product.price}</p>
                    <p class="product-old-price">${product.oldPrice ? `৳${product.oldPrice}` : ''}</p>
                </div>
                <div class="variant-options">
                    <!-- Variants will be added here -->
                </div>
                <div class="quantity-section">
                    <label for="quantity">পরিমাণ:</label>
                    <input type="number" id="quantity" value="1" min="1" max="100">
                </div>
                <p class="product-description">${product.description.replace(/\n/g, '<br>')}</p>
                <div class="order-buttons">
                    <button class="whatsapp-order-btn" data-product-id="${product.id}">
                        <i class="fab fa-whatsapp"></i> মেসেঞ্জার অর্ডার
                    </button>
                    <button class="add-to-cart-btn" data-product-id="${product.id}">
                        <i class="fas fa-shopping-cart"></i> Add to Cart
                    </button>
                </div>
            </div>
        `;
        productDetailModal.style.display = 'block';
        document.body.classList.add('modal-open');

        // Add event listener for "Add to Cart" button in the modal
        const addToCartBtn = document.querySelector('.add-to-cart-btn');
        if (addToCartBtn) {
            addToCartBtn.addEventListener('click', () => {
                const quantity = parseInt(document.getElementById('quantity').value, 10);
                const productToAdd = {
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    image: product.image,
                    quantity: quantity || 1
                };
                addToCart(productToAdd);
                productDetailModal.style.display = 'none';
                document.body.classList.remove('modal-open');
            });
        }
    };

    // Fetch and parse CSV data
    const fetchCSV = async () => {
        try {
            const response = await fetch(csvUrl);
            const data = await response.text();
            const rows = data.split('\n').slice(1).filter(row => row.trim() !== ''); // Skip header and empty rows
            allProducts = rows.map(row => {
                const columns = row.split(',').map(col => col.trim());
                return {
                    id: columns[0],
                    name: columns[1],
                    price: parseFloat(columns[2]),
                    oldPrice: columns[3] ? parseFloat(columns[3]) : null,
                    image: columns[4],
                    description: columns[5],
                    category: columns[6]
                };
            });
            displayProducts(allProducts);

            // Dynamically create category filters
            const categories = [...new Set(allProducts.map(p => p.category))];
            const categoryFilterContainer = document.querySelector('.category-filter');
            categories.forEach(cat => {
                if (cat) {
                    const categoryItem = document.createElement('span');
                    categoryItem.className = 'category-item';
                    categoryItem.dataset.category = cat.toLowerCase().replace(/\s/g, '-');
                    categoryItem.textContent = cat;
                    categoryFilterContainer.appendChild(categoryItem);
                }
            });

        } catch (error) {
            console.error('Error fetching CSV:', error);
        }
    };

    // Event listeners
    productModalCloseBtn.addEventListener('click', () => {
        productDetailModal.style.display = 'none';
        document.body.classList.remove('modal-open');
    });

    // Handle order via WhatsApp from product detail page
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('whatsapp-order-btn') && !e.target.classList.contains('add-to-cart-btn')) {
            const productId = e.target.dataset.productId;
            const product = allProducts.find(p => p.id === productId);
            if (product) {
                document.getElementById('product-name-input').value = product.name;
                document.getElementById('product-id-input').value = product.id;
                orderModal.style.display = 'block';
                document.body.classList.add('modal-open');
            }
        }
    });

    orderModal.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal-close')) {
            orderModal.style.display = 'none';
            document.body.classList.remove('modal-open');
        }
    });

    orderForm.addEventListener('submit', e => {
        e.preventDefault();
        const name = document.getElementById('customer-name').value;
        const address = document.getElementById('customer-address').value;
        const mobile = document.getElementById('customer-mobile').value;
        const productName = document.getElementById('product-name-input').value;
        const productId = document.getElementById('product-id-input').value;

        const msg = `🛒 নতুন অর্ডার!\nপণ্যের নাম: ${productName}\nID: ${productId}\n\nক্রেতা: ${name}\nঠিকানা: ${address}\nমোবাইল: ${mobile}`;
        window.open(`https://wa.me/8801778095805?text=${encodeURIComponent(msg)}`, '_blank');
        orderModal.style.display = 'none';
    });

    // Category filter
    categoryItems.forEach(item => {
        item.addEventListener('click', () => {
            document.querySelector('.category-item.active')?.classList.remove('active');
            item.classList.add('active');
            const cat = item.dataset.category;
            const filtered = cat === 'all' ? allProducts : allProducts.filter(p => p.category && p.category.toLowerCase().replace(/\s/g, '-') === cat);
            displayProducts(filtered);
        });
    });

    // Cart icon click to redirect to a new cart page (or show empty message)
    cartIcons.forEach(icon => {
        icon.addEventListener('click', () => {
            if (cart.length > 0) {
                // In a real application, you would redirect to a cart page.
                // For this example, we'll log to console and show a simple alert.
                // Redirecting to an external cart.html page if it exists.
                window.location.href = 'cart.html';
            } else {
                showNotification("আপনার কার্ট খালি।");
            }
        });
    });

    // Initial setup
    fetchCSV();
    loadCart();

});
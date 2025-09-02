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
    const GITHUB_IMAGE_BASE_URL = 'https://ilmorafashionbd-ux.github.io/My-Bazaar-/images/';

    let allProducts = [];
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    // Selectors
    const productGrid = document.getElementById('product-grid');
    const productDetailModal = document.getElementById('product-detail-modal');
    const productDetailContainer = document.getElementById('product-detail-container');
    const productModalCloseBtn = document.getElementById('product-modal-close');
    const orderModal = document.getElementById('order-modal');
    const orderForm = document.getElementById('order-form');
    const cartCountTop = document.querySelector('.cart-count');
    const cartCountBottom = document.querySelector('.cart-count-bottom');
    const cartIconTop = document.getElementById('cart-icon-top');
    const cartIconBottom = document.getElementById('cart-icon-bottom');
    const cartPage = document.getElementById('cart-page');
    const cartPageCloseBtn = document.getElementById('cart-page-close');
    const cartItemsContainer = document.getElementById('cart-items-container');
    const cartTotalAmount = document.getElementById('cart-total-amount');
    const checkoutBtn = document.getElementById('checkout-btn');

    // Function to load products from CSV
    function loadProducts() {
        Papa.parse(csvUrl, {
            download: true,
            header: true,
            complete: function(results) {
                allProducts = results.data.filter(product => product.id && product.name);
                displayProducts(allProducts);
            },
            error: function(error) {
                console.error('Error loading products:', error);
                productGrid.innerHTML = '<p class="error-message">পণ্য লোড করতে সমস্যা হচ্ছে। দয়া করে পরে আবার চেষ্টা করুন।</p>';
            }
        });
    }

    // Function to display products in the grid
    function displayProducts(products) {
        productGrid.innerHTML = '';
        
        products.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            productCard.dataset.id = product.id;
            
            const imageUrl = product.image ? `${GITHUB_IMAGE_BASE_URL}${product.image}` : `${GITHUB_IMAGE_BASE_URL}placeholder.jpg`;
            
            productCard.innerHTML = `
                <div class="product-image">
                    <img src="${imageUrl}" alt="${product.name}" loading="lazy">
                    ${product.stock === '0' ? '<div class="stock-status">স্টক আউট</div>' : ''}
                </div>
                <div class="product-info">
                    <h3 class="product-name">${product.name}</h3>
                    <p class="product-price">${product.price}৳</p>
                    <div class="product-actions">
                        <button class="order-btn" onclick="openOrderModal('${product.id}', '${product.name.replace(/'/g, "\\'")}')" ${product.stock === '0' ? 'disabled' : ''}>
                            <i class="fab fa-whatsapp"></i> হোয়াটসঅ্যাপে অর্ডার
                        </button>
                    </div>
                </div>
            `;
            
            productCard.addEventListener('click', (e) => {
                if (!e.target.closest('.product-actions')) {
                    showProductDetail(product.id);
                }
            });
            
            productGrid.appendChild(productCard);
        });
    }

    // Function to show product detail in modal
    function showProductDetail(productId) {
        const product = allProducts.find(p => p.id === productId);
        if (!product) return;
        
        const imageUrl = product.image ? `${GITHUB_IMAGE_BASE_URL}${product.image}` : `${GITHUB_IMAGE_BASE_URL}placeholder.jpg`;
        
        productDetailContainer.innerHTML = `
            <div class="product-detail-premium">
                <div class="product-detail-images">
                    <img src="${imageUrl}" alt="${product.name}" class="main-image" id="main-image">
                    <div class="thumbnail-images">
                        <img src="${imageUrl}" alt="${product.name}" class="thumbnail active" onclick="changeMainImage(this)">
                    </div>
                </div>
                <div class="product-detail-info">
                    <h2 class="product-title">${product.name}</h2>
                    <div class="product-meta">
                        <div class="meta-item">
                            <i class="fas fa-shopping-bag"></i>
                            <strong>ক্যাটাগরি:</strong> ${product.category || 'N/A'}
                        </div>
                        <div class="meta-item">
                            <i class="fas fa-box"></i>
                            <strong>স্টক:</strong> ${product.stock === '0' ? 'স্টক আউট' : 'স্টকে আছে'}
                        </div>
                    </div>
                    <div class="product-price-section">
                        <div class="price-main">${product.price}৳</div>
                    </div>
                    <div class="product-description">
                        <h3 class="description-title">পণ্যের বিবরণ</h3>
                        <div class="description-content">
                            ${product.description || 'কোন বিবরণ পাওয়া যায়নি।'}
                        </div>
                    </div>
                    <div class="order-buttons">
                        <button class="whatsapp-order-btn" onclick="openOrderModal('${product.id}', '${product.name.replace(/'/g, "\\'")}')" ${product.stock === '0' ? 'disabled' : ''}>
                            <i class="fab fa-whatsapp"></i> হোয়াটসঅ্যাপে অর্ডার করুন
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        openModal(productDetailModal);
    }

    // Function to open order modal
    window.openOrderModal = function(productId, productName) {
        document.getElementById('product-name-input').value = productName;
        document.getElementById('product-id-input').value = productId;
        openModal(orderModal);
    };

    // Function to open modal
    function openModal(modal) {
        modal.style.display = 'block';
        document.body.classList.add('modal-open');
    }

    // Function to close modal
    function closeModal(modal) {
        modal.style.display = 'none';
        document.body.classList.remove('modal-open');
    }

    // Close modals when clicking on close button
    productModalCloseBtn.addEventListener('click', () => closeModal(productDetailModal));
    document.getElementById('order-modal-close').addEventListener('click', () => closeModal(orderModal));
    cartPageCloseBtn.addEventListener('click', () => closeModal(cartPage));

    // Close modal when clicking outside of it
    window.addEventListener('click', (e) => {
        if (e.target === productDetailModal) closeModal(productDetailModal);
        if (e.target === orderModal) closeModal(orderModal);
        if (e.target === cartPage) closeModal(cartPage);
    });

    // Handle order form submission
    orderForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const productName = document.getElementById('product-name-input').value;
        const productId = document.getElementById('product-id-input').value;
        const customerName = document.getElementById('customer-name').value;
        const customerAddress = document.getElementById('customer-address').value;
        const customerMobile = document.getElementById('customer-mobile').value;
        
        const whatsappMessage = `*অর্ডার রিকোয়েস্ট*%0A%0A*পণ্যের নাম:* ${productName}%0A*ক্রেতার নাম:* ${customerName}%0A*ঠিকানা:* ${customerAddress}%0A*মোবাইল নম্বর:* ${customerMobile}`;
        
        const whatsappUrl = `https://wa.me/8801778095805?text=${whatsappMessage}`;
        
        window.open(whatsappUrl, '_blank');
        closeModal(orderModal);
        orderForm.reset();
    });

    // Cart functionality
    function updateCartCount() {
        const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
        cartCountTop.textContent = totalItems;
        cartCountBottom.textContent = totalItems;
    }

    function addToCart(productId) {
        const product = allProducts.find(p => p.id === productId);
        if (!product) return;
        
        const existingItem = cart.find(item => item.id === productId);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                id: product.id,
                name: product.name,
                price: parseFloat(product.price),
                image: product.image,
                quantity: 1
            });
        }
        
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
    }

    function removeFromCart(productId) {
        cart = cart.filter(item => item.id !== productId);
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        renderCartItems();
    }

    function updateQuantity(productId, newQuantity) {
        const item = cart.find(item => item.id === productId);
        if (item) {
            item.quantity = Math.max(1, newQuantity);
            localStorage.setItem('cart', JSON.stringify(cart));
            renderCartItems();
        }
    }

    function renderCartItems() {
        cartItemsContainer.innerHTML = '';
        
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p class="empty-cart-message">আপনার কার্টে কোন পণ্য নেই</p>';
            cartTotalAmount.textContent = '0';
            return;
        }
        
        let total = 0;
        
        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            
            const imageUrl = item.image ? `${GITHUB_IMAGE_BASE_URL}${item.image}` : `${GITHUB_IMAGE_BASE_URL}placeholder.jpg`;
            
            cartItem.innerHTML = `
                <img src="${imageUrl}" alt="${item.name}" class="cart-item-image">
                <div class="cart-item-details">
                    <h3 class="cart-item-name">${item.name}</h3>
                    <p class="cart-item-price">${item.price}৳ x ${item.quantity} = ${itemTotal}৳</p>
                    <div class="cart-item-quantity">
                        <button class="quantity-btn" onclick="updateQuantity('${item.id}', ${item.quantity - 1})">-</button>
                        <input type="number" value="${item.quantity}" min="1" onchange="updateQuantity('${item.id}', parseInt(this.value))">
                        <button class="quantity-btn" onclick="updateQuantity('${item.id}', ${item.quantity + 1})">+</button>
                    </div>
                </div>
                <button class="remove-from-cart" onclick="removeFromCart('${item.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            `;
            
            cartItemsContainer.appendChild(cartItem);
        });
        
        cartTotalAmount.textContent = total;
    }

    // Make cart functions available globally
    window.removeFromCart = removeFromCart;
    window.updateQuantity = updateQuantity;

    // Open cart page
    function openCartPage() {
        renderCartItems();
        openModal(cartPage);
    }

    cartIconTop.addEventListener('click', openCartPage);
    cartIconBottom.addEventListener('click', openCartPage);

    // Checkout functionality
    checkoutBtn.addEventListener('click', () => {
        if (cart.length === 0) return;
        
        let whatsappMessage = `*কার্ট চেকআউট*%0A%0A*পণ্যের তালিকা:*%0A`;
        
        cart.forEach((item, index) => {
            whatsappMessage += `${index + 1}. ${item.name} - ${item.quantity} x ${item.price}৳ = ${item.quantity * item.price}৳%0A`;
        });
        
        const totalAmount = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
        whatsappMessage += `%0A*মোট মূল্য:* ${totalAmount}৳%0A%0A`;
        whatsappMessage += `*ক্রেতার নাম:* [আপনার নাম লিখুন]%0A`;
        whatsappMessage += `*ঠিকানা:* [আপনার সম্পূর্ণ ঠিকানা লিখুন]%0A`;
        whatsappMessage += `*মোবাইল নম্বর:* [আপনার মোবাইল নম্বর লিখুন]`;
        
        const whatsappUrl = `https://wa.me/8801778095805?text=${whatsappMessage}`;
        
        window.open(whatsappUrl, '_blank');
    });

    // Initialize the page
    loadProducts();
    updateCartCount();

    // Function to change main image in product detail
    window.changeMainImage = function(thumb) {
        document.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
        thumb.classList.add('active');
        document.getElementById('main-image').src = thumb.src;
    };
});
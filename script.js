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
    const orderModalCloseBtn = document.getElementById('order-modal-close');
    const customerNameInput = document.getElementById('customer-name');
    const customerAddressInput = document.getElementById('customer-address');
    const customerMobileInput = document.getElementById('customer-mobile');
    const orderProductNameInput = document.getElementById('product-name-input');
    const orderProductIdInput = document.getElementById('product-id-input');
    const whatsappBtn = document.getElementById('whatsapp-order-btn-modal');
    const messengerBtn = document.getElementById('messenger-order-btn-modal');


    // Function to fetch products from Google Sheets
    async function fetchProducts() {
        try {
            const response = await fetch(csvUrl);
            const csvText = await response.text();
            const { data } = Papa.parse(csvText, { header: true, skipEmptyLines: true });
            allProducts = data.map(product => {
                const cleanedProduct = {};
                for (const key in product) {
                    if (Object.hasOwnProperty.call(product, key)) {
                        cleanedProduct[key.trim()] = product[key];
                    }
                }
                const imageList = cleanedProduct['Images'] ? cleanedProduct['Images'].split(',').map(img => img.trim()).filter(img => img.length > 0) : [];
                return {
                    id: cleanedProduct['ID'],
                    name: cleanedProduct['Name'],
                    price: parseFloat(cleanedProduct['Price']),
                    description: cleanedProduct['Description'],
                    category: cleanedProduct['Category'],
                    stock: cleanedProduct['Stock Status'],
                    variants: cleanedProduct['Variants'] ? cleanedProduct['Variants'].split(',').map(v => v.trim()) : null,
                    images: imageList,
                    youtube: cleanedProduct['YouTube Link'] || ''
                };
            });
            displayProducts(allProducts);
        } catch (error) {
            console.error('Error fetching data:', error);
            productGrid.innerHTML = '<p style="text-align: center; color: red;">পণ্য লোড করা যায়নি। অনুগ্রহ করে পরে আবার চেষ্টা করুন।</p>';
        }
    }

    // Function to update cart count
    function updateCartCount() {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCountTop.innerText = totalItems;
        cartCountBottom.innerText = totalItems;
        if (totalItems > 0) {
            cartCountTop.style.display = 'block';
            cartCountBottom.style.display = 'block';
        } else {
            cartCountTop.style.display = 'none';
            cartCountBottom.style.display = 'none';
        }
    }
    
    // Function to add a product to the cart
    function addToCart(product, quantity = 1, variant = null) {
        const existingItem = cart.find(item => item.id === product.id && item.variant === variant);
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.images[0] || '',
                quantity: quantity,
                variant: variant
            });
        }
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        alert(`${product.name}${variant ? ` (${variant})` : ''} কার্টে যোগ করা হয়েছে!`);
    }

    // Function to display products on the homepage
    function displayProducts(products) {
        if (!productGrid) return;
        productGrid.innerHTML = '';
        products.forEach(product => {
            const card = document.createElement('div');
            card.classList.add('product-card');
            card.setAttribute('data-id', product.id);

            const isOutOfStock = product.stock === 'Out of Stock';
            const imageUrl = product.images[0] ? `${GITHUB_IMAGE_BASE_URL}${product.images[0]}` : '';

            card.innerHTML = `
                <div class="product-image">
                    ${isOutOfStock ? `<span class="stock-status">স্টক নেই</span>` : ''}
                    <img src="${imageUrl}" alt="${product.name}">
                </div>
                <div class="product-info">
                    <h3 class="product-name">${product.name}</h3>
                    <p class="product-price">${product.price}৳</p>
                    <div class="product-actions">
                        <button class="order-btn" data-id="${product.id}" ${isOutOfStock ? 'disabled' : ''}>অর্ডার করুন</button>
                    </div>
                </div>
            `;
            productGrid.appendChild(card);
        });
    }
    
    // Function to open the product detail modal
    function openProductDetailModal(product) {
        if (!productDetailContainer) return;
        
        const isOutOfStock = product.stock === 'Out of Stock';
        const mainImageUrl = product.images[0] ? `${GITHUB_IMAGE_BASE_URL}${product.images[0]}` : '';
        const thumbnailsHtml = product.images.length > 1 ? product.images.map((img, index) => `<img src="${GITHUB_IMAGE_BASE_URL}${img}" class="thumbnail ${index === 0 ? 'active' : ''}" data-index="${index}">`).join('') : '';

        const variantsHtml = product.variants ? `
            <div class="variant-selector">
                <span class="variant-label">ভেরিয়েন্ট:</span>
                <div class="variant-options">
                    ${product.variants.map((variant, index) => `<span class="variant-option" data-variant="${variant}" ${index === 0 ? 'selected' : ''}>${variant}</span>`).join('')}
                </div>
            </div>` : '';

        productDetailContainer.innerHTML = `
            <div class="product-detail-layout">
                <div class="product-detail-images">
                    <img id="main-product-image" class="main-image" src="${mainImageUrl}" alt="${product.name}">
                    <div class="thumbnail-images">
                        ${thumbnailsHtml}
                    </div>
                </div>
                <div class="product-detail-info">
                    <h2 class="product-title">${product.name}</h2>
                    <div class="product-meta">
                        <span class="meta-item"><i class="fas fa-tag"></i> <strong>${product.category}</strong></span>
                        <span class="meta-item"><i class="fas fa-box"></i> <strong>${product.stock}</strong></span>
                    </div>
                    ${product.youtube ? `<a href="${product.youtube}" target="_blank" class="meta-item"><i class="fab fa-youtube" style="color: #ff0000;"></i> <strong>ভিডিও দেখুন</strong></a>` : ''}
                    <div class="product-price-section">
                        <span class="price-main">${product.price}৳</span>
                    </div>
                    ${variantsHtml}
                    <div class="quantity-selector">
                        <span class="quantity-label">পরিমাণ:</span>
                        <div class="quantity-controls">
                            <button class="quantity-btn decrease-quantity">-</button>
                            <input type="number" class="quantity-input" value="1" min="1" max="99">
                            <button class="quantity-btn increase-quantity">+</button>
                        </div>
                    </div>
                    <div class="order-buttons">
                        <button class="add-to-cart-detail-btn" data-id="${product.id}" ${isOutOfStock ? 'disabled' : ''}>
                            <i class="fas fa-shopping-cart"></i> কার্টে যোগ করুন
                        </button>
                        <button id="whatsapp-order-btn" class="whatsapp-order-btn" data-id="${product.id}" ${isOutOfStock ? 'disabled' : ''}>
                            <i class="fab fa-whatsapp"></i> হোয়াটসঅ্যাপে অর্ডার করুন
                        </button>
                    </div>
                    <div class="product-description">
                        <h3 class="description-title">পণ্যের বিবরণ</h3>
                        <p class="description-content">${product.description}</p>
                    </div>
                </div>
            </div>
        `;
        productDetailModal.style.display = 'block';
        document.body.classList.add('modal-open');

        // Event listeners for the detail modal
        const mainImage = document.getElementById('main-product-image');
        const thumbnails = productDetailContainer.querySelectorAll('.thumbnail');
        const variantOptions = productDetailContainer.querySelectorAll('.variant-option');
        const decreaseBtn = productDetailContainer.querySelector('.decrease-quantity');
        const increaseBtn = productDetailContainer.querySelector('.increase-quantity');
        const quantityInput = productDetailContainer.querySelector('.quantity-input');
        const addToCartBtn = productDetailContainer.querySelector('.add-to-cart-detail-btn');
        const whatsappOrderBtn = productDetailContainer.querySelector('#whatsapp-order-btn');

        thumbnails.forEach(thumbnail => {
            thumbnail.addEventListener('click', () => {
                mainImage.src = thumbnail.src;
                thumbnails.forEach(t => t.classList.remove('active'));
                thumbnail.classList.add('active');
            });
        });

        variantOptions.forEach(option => {
            option.addEventListener('click', () => {
                variantOptions.forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');
            });
        });

        decreaseBtn.addEventListener('click', () => {
            let currentQuantity = parseInt(quantityInput.value);
            if (currentQuantity > 1) {
                quantityInput.value = currentQuantity - 1;
            }
        });

        increaseBtn.addEventListener('click', () => {
            let currentQuantity = parseInt(quantityInput.value);
            quantityInput.value = currentQuantity + 1;
        });

        // Add to Cart from Detail Page
        if (addToCartBtn) {
            addToCartBtn.addEventListener('click', () => {
                const quantity = parseInt(quantityInput.value);
                const selectedVariant = productDetailContainer.querySelector('.variant-option.selected')?.dataset.variant || null;
                addToCart(product, quantity, selectedVariant);
                productDetailModal.style.display = 'none';
                document.body.classList.remove('modal-open');
            });
        }

        // WhatsApp Order from Detail Page
        if (whatsappOrderBtn) {
            whatsappOrderBtn.addEventListener('click', () => {
                const quantity = parseInt(quantityInput.value);
                const selectedVariant = productDetailContainer.querySelector('.variant-option.selected')?.dataset.variant || null;
                let message = `আমি এই পণ্যটি অর্ডার করতে চাই:\n\n*${product.name}${selectedVariant ? ` (${selectedVariant})` : ''}*\nপরিমাণ: ${quantity}\nমূল্য: ${product.price}৳`;
                const encodedMessage = encodeURIComponent(message);
                window.open(`https://wa.me/8801778095805?text=${encodedMessage}`, '_blank');
            });
        }
    }

    // Function to open the order form modal for a single product
    function openOrderModal(product) {
        if (!orderModal) return;
        orderModal.style.display = 'block';
        orderProductNameInput.value = product.name;
        orderProductIdInput.value = product.id;
        document.body.classList.add('modal-open');
    }

    // Event listeners
    productGrid.addEventListener('click', (e) => {
        const productCard = e.target.closest('.product-card');
        if (!productCard) return;

        const productId = productCard.dataset.id;
        const product = allProducts.find(p => p.id === productId);
        if (product) {
             openProductDetailModal(product);
        }
    });

    // Close modal event listeners
    if (productModalCloseBtn) {
        productModalCloseBtn.addEventListener('click', () => {
            productDetailModal.style.display = 'none';
            document.body.classList.remove('modal-open');
        });
    }
    if (orderModalCloseBtn) {
        orderModalCloseBtn.addEventListener('click', () => {
            orderModal.style.display = 'none';
            document.body.classList.remove('modal-open');
        });
    }

    // Form submission for single product order
    if (orderForm) {
        orderForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const productName = orderProductNameInput.value;
            const customerName = customerNameInput.value;
            const customerAddress = customerAddressInput.value;
            const customerMobile = customerMobileInput.value;

            const message = `আমি এই পণ্যটি অর্ডার করতে চাই:
*পণ্য:* ${productName}
*নাম:* ${customerName}
*ঠিকানা:* ${customerAddress}
*মোবাইল:* ${customerMobile}`;
            const encodedMessage = encodeURIComponent(message);
            window.open(`https://wa.me/8801778095805?text=${encodedMessage}`, '_blank');

            orderModal.style.display = 'none';
            document.body.classList.remove('modal-open');
            orderForm.reset();
        });
    }

    // Listen for clicks on the "Order" button on product cards
    productGrid.addEventListener('click', (e) => {
        if (e.target.classList.contains('order-btn')) {
            const productId = e.target.dataset.id;
            const product = allProducts.find(p => p.id === productId);
            if (product) {
                openOrderModal(product);
            }
        }
    });
    
    // Category filter functionality
    const categoryItems = document.querySelectorAll('.category-item');
    categoryItems.forEach(item => {
        item.addEventListener('click', (e) => {
            const cat = e.currentTarget.dataset.category;
            const allProductsSection = document.getElementById('products');
            if (allProductsSection) {
                allProductsSection.scrollIntoView({ behavior: 'smooth' });
            }

            if (cat === 'all') {
                displayProducts(allProducts);
                return;
            }

            const filtered = allProducts.filter(p => p.category && p.category.toLowerCase().replace(/\s/g,'-') === cat);
            displayProducts(filtered);
        });
    });

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
            document.body.classList.remove('modal-open');
        }
    });

    // Initialize the page
    fetchProducts();
    updateCartCount();
});
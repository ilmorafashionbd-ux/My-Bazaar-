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

    // Check if URL has product ID parameter for single product view
    const urlParams = new URLSearchParams(window.location.search);
    const productIdFromUrl = urlParams.get('product');
    const isSingleProductView = productIdFromUrl !== null;

    // Fetch products from Google Sheet
    const fetchProducts = async () => {
        try {
            const response = await fetch(csvUrl);
            const text = await response.text();
            Papa.parse(text, {
                header: true,
                dynamicTyping: true,
                complete: (results) => {
                    allProducts = results.data.filter(product => product.id);
                    
                    if (isSingleProductView) {
                        // Show single product view if product ID is in URL
                        const product = allProducts.find(p => p.id == productIdFromUrl);
                        if (product) {
                            showSingleProductView(product);
                        } else {
                            document.body.innerHTML = '<div class="container"><p>পণ্যটি পাওয়া যায়নি। <a href="index.html">হোমপেজে ফিরে যান</a></p></div>';
                        }
                    } else if (allProducts.length > 0) {
                        displayProducts(allProducts);
                    } else {
                        productGrid.innerHTML = '<p>কোনো প্রোডাক্ট পাওয়া যায়নি।</p>';
                    }
                }
            });
        } catch (error) {
            console.error('Failed to fetch products:', error);
        }
    };

    // Display products on homepage
    const displayProducts = (productsToDisplay) => {
        productGrid.innerHTML = '';
        if (productsToDisplay.length === 0) {
            productGrid.innerHTML = '<p>এই ক্যাটাগরিতে কোনো পণ্য নেই।</p>';
            return;
        }

        productsToDisplay.forEach(product => {
            if (!product.id || !product.product_name || !product.price || !product.image_url) return;

            const mainImageUrl = GITHUB_IMAGE_BASE_URL + product.image_url;
            const isOutOfStock = product.stock_status && product.stock_status.toLowerCase() === 'out of stock';

            const productCard = document.createElement('div');
            productCard.classList.add('product-card');
            productCard.dataset.productId = product.id;

            productCard.innerHTML = `
                <div class="product-image">
                    <img src="${mainImageUrl}" alt="${product.product_name}" 
                        onerror="this.onerror=null;this.src='https://placehold.co/400x400?text=No+Image';">
                    ${isOutOfStock ? `<span class="stock-status">Out of stock</span>` : ''}
                </div>
                <div class="product-info">
                    <h3 class="product-name">${product.product_name}</h3>
                    <p class="product-price">৳ ${product.price}</p>
                    <button class="order-btn" ${isOutOfStock ? 'disabled' : ''}>
                        ${isOutOfStock ? 'স্টকে নেই' : 'অর্ডার করুন'}
                    </button>
                </div>
            `;

            // Add event listener to show product details
            productCard.querySelector('.order-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                if (!isOutOfStock) {
                    openOrderModal(product);
                }
            });

            productCard.addEventListener('click', () => {
                openProductDetailModal(product);
            });

            productGrid.appendChild(productCard);
        });
    };

    // Open product detail modal
    const openProductDetailModal = (product) => {
        const imageUrls = [product.image_url];
        if (product.image2) imageUrls.push(product.image2);
        if (product.image3) imageUrls.push(product.image3);
        if (product.image4) imageUrls.push(product.image4);

        const isOutOfStock = product.stock_status && product.stock_status.toLowerCase() === 'out of stock';

        // Get related products (same category, excluding current product)
        const relatedProducts = allProducts.filter(p => 
            p.category === product.category && p.id !== product.id
        ).slice(0, 4); // Limit to 4 related products

        productDetailContainer.innerHTML = `
            <div class="product-detail-premium">
                <div class="product-detail-images">
                    <img src="${GITHUB_IMAGE_BASE_URL + imageUrls[0]}" alt="${product.product_name}" 
                         class="main-image" id="main-product-image"
                         onerror="this.onerror=null;this.src='https://placehold.co/600x600?text=No+Image';">
                    <div class="thumbnail-images">
                        ${imageUrls.map((url, index) => `
                            <img src="${GITHUB_IMAGE_BASE_URL + url}" alt="Thumbnail ${index + 1}" 
                                 class="thumbnail ${index === 0 ? 'active' : ''}"
                                 onerror="this.onerror=null;this.src='https://placehold.co/100x100?text=No+Image';">
                        `).join('')}
                    </div>
                </div>
                <div class="product-detail-info">
                    <h2 class="product-title">${product.product_name}</h2>
                    <div class="product-meta">
                        <div class="meta-item">
                            <strong>ক্যাটাগরি:</strong> ${product.category || 'N/A'}
                        </div>
                        <div class="meta-item">
                            <strong>স্টক:</strong> 
                            <span style="color: ${isOutOfStock ? '#dc3545' : '#28a745'}">
                                ${isOutOfStock ? 'স্টকে নেই' : 'স্টকে আছে'}
                            </span>
                        </div>
                    </div>
                    <div class="product-price-section">
                        <div class="price-main">৳ ${product.price}</div>
                        ${product.price_range ? `<div class="price-range">${product.price_range}</div>` : ''}
                    </div>
                    ${product.variants ? `
                        <div class="variant-selector">
                            <label class="variant-label">ভ্যারিয়েন্ট নির্বাচন করুন:</label>
                            <div class="variant-options">
                                ${product.variants.split(',').map(variant => `
                                    <div class="variant-option">${variant.trim()}</div>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                    <div class="quantity-selector">
                        <span class="quantity-label">পরিমাণ:</span>
                        <div class="quantity-controls">
                            <button class="quantity-btn" id="decrease-quantity">-</button>
                            <input type="number" class="quantity-input" id="product-quantity" value="1" min="1">
                            <button class="quantity-btn" id="increase-quantity">+</button>
                        </div>
                    </div>
                    <div class="order-buttons">
                        <button class="whatsapp-order-btn" ${isOutOfStock ? 'disabled' : ''}>
                            <i class="fab fa-whatsapp"></i> হোয়াটসঅ্যাপে অর্ডার করুন
                        </button>
                        <button class="messenger-order-btn" ${isOutOfStock ? 'disabled' : ''}>
                            <i class="fab fa-facebook-messenger"></i> মেসেঞ্জারে অর্ডার করুন
                        </button>
                    </div>
                    <div class="product-description">
                        <h3 class="description-title">পণ্যের বিবরণ</h3>
                        <div class="description-content">
                            ${product.description || 'কোনো বিবরণ পাওয়া যায়নি।'}
                        </div>
                    </div>
                </div>
                ${relatedProducts.length > 0 ? `
                    <div class="related-products">
                        <h3 class="related-title">সম্পর্কিত পণ্য</h3>
                        <div class="related-grid">
                            ${relatedProducts.map(relatedProduct => {
                                const isRelatedOutOfStock = relatedProduct.stock_status && 
                                    relatedProduct.stock_status.toLowerCase() === 'out of stock';
                                return `
                                    <div class="product-card" data-product-id="${relatedProduct.id}">
                                        <div class="product-image">
                                            <img src="${GITHUB_IMAGE_BASE_URL + relatedProduct.image_url}" 
                                                 alt="${relatedProduct.product_name}"
                                                 onerror="this.onerror=null;this.src='https://placehold.co/400x400?text=No+Image';">
                                            ${isRelatedOutOfStock ? `<span class="stock-status">Out of stock</span>` : ''}
                                        </div>
                                        <div class="product-info">
                                            <h3 class="product-name">${relatedProduct.product_name}</h3>
                                            <p class="product-price">৳ ${relatedProduct.price}</p>
                                            <button class="order-btn" ${isRelatedOutOfStock ? 'disabled' : ''}>
                                                ${isRelatedOutOfStock ? 'স্টকে নেই' : 'অর্ডার করুন'}
                                            </button>
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;

        // Add event listeners for thumbnails
        const thumbnails = productDetailContainer.querySelectorAll('.thumbnail');
        const mainImage = productDetailContainer.querySelector('#main-product-image');

        thumbnails.forEach(thumb => {
            thumb.addEventListener('click', () => {
                thumbnails.forEach(t => t.classList.remove('active'));
                thumb.classList.add('active');
                mainImage.src = thumb.src;
            });
        });

        // Add event listeners for variant options
        const variantOptions = productDetailContainer.querySelectorAll('.variant-option');
        variantOptions.forEach(option => {
            option.addEventListener('click', () => {
                variantOptions.forEach(o => o.classList.remove('selected'));
                option.classList.add('selected');
            });
        });

        // Add event listeners for quantity controls
        const decreaseBtn = productDetailContainer.querySelector('#decrease-quantity');
        const increaseBtn = productDetailContainer.querySelector('#increase-quantity');
        const quantityInput = productDetailContainer.querySelector('#product-quantity');

        decreaseBtn.addEventListener('click', () => {
            if (quantityInput.value > 1) {
                quantityInput.value = parseInt(quantityInput.value) - 1;
            }
        });

        increaseBtn.addEventListener('click', () => {
            quantityInput.value = parseInt(quantityInput.value) + 1;
        });

        // Add event listeners for order buttons
        const whatsappBtn = productDetailContainer.querySelector('.whatsapp-order-btn');
        const messengerBtn = productDetailContainer.querySelector('.messenger-order-btn');

        if (whatsappBtn && !isOutOfStock) {
            whatsappBtn.addEventListener('click', () => {
                const selectedVariant = productDetailContainer.querySelector('.variant-option.selected');
                const variantText = selectedVariant ? selectedVariant.textContent : '';
                const quantity = quantityInput.value;
                openOrderModal(product, variantText, quantity);
            });
        }

        if (messengerBtn && !isOutOfStock) {
            messengerBtn.addEventListener('click', () => {
                const selectedVariant = productDetailContainer.querySelector('.variant-option.selected');
                const variantText = selectedVariant ? selectedVariant.textContent : '';
                const quantity = quantityInput.value;
                openMessengerOrder(product, variantText, quantity);
            });
        }

        // Add event listeners to related products
        const relatedProductCards = productDetailContainer.querySelectorAll('.related-products .product-card');
        relatedProductCards.forEach(card => {
            card.addEventListener('click', () => {
                const relatedProductId = card.dataset.productId;
                const relatedProduct = allProducts.find(p => p.id == relatedProductId);
                if (relatedProduct) {
                    openProductDetailModal(relatedProduct);
                }
            });
        });

        // Show the modal
        productDetailModal.style.display = 'block';
        document.body.classList.add('modal-open');
    };

    // Open order modal
    const openOrderModal = (product, variant = '', quantity = 1) => {
        document.getElementById('product-name-input').value = `${product.product_name}${variant ? ` (${variant})` : ''}`;
        document.getElementById('product-id-input').value = product.id;
        
        orderModal.style.display = 'block';
        document.body.classList.add('modal-open');
    };

    // Open Messenger order
    const openMessengerOrder = (product, variant = '', quantity = 1) => {
        const message = `আমি এই পণ্যটি অর্ডার করতে চাই:\n\nপণ্যের নাম: ${product.product_name}${variant ? ` (${variant})` : ''}\nপরিমাণ: ${quantity}\nমূল্য: ৳${product.price}`;
        const encodedMessage = encodeURIComponent(message);
        window.open(`https://m.me/61578353266944?text=${encodedMessage}`, '_blank');
    };

    // Close modals
    const closeModals = () => {
        productDetailModal.style.display = 'none';
        orderModal.style.display = 'none';
        document.body.classList.remove('modal-open');
    };

    // Event listeners for closing modals
    productModalCloseBtn.addEventListener('click', closeModals);
    document.getElementById('order-modal-close').addEventListener('click', closeModals);

    window.addEventListener('click', (e) => {
        if (e.target === productDetailModal || e.target === orderModal) {
            closeModals();
        }
    });

    // Handle order form submission
    orderForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const productName = document.getElementById('product-name-input').value;
        const customerName = document.getElementById('customer-name').value;
        const customerAddress = document.getElementById('customer-address').value;
        const customerMobile = document.getElementById('customer-mobile').value;
        
        const message = `নতুন অর্ডার:\n\nপণ্যের নাম: ${productName}\nগ্রাহকের নাম: ${customerName}\nঠিকানা: ${customerAddress}\nমোবাইল: ${customerMobile}`;
        const encodedMessage = encodeURIComponent(message);
        
        window.open(`https://wa.me/8801778095805?text=${encodedMessage}`, '_blank');
        
        // Reset form and close modal
        orderForm.reset();
        closeModals();
    });

    // Handle category filtering
    categoryItems.forEach(item => {
        item.addEventListener('click', () => {
            const category = item.dataset.category;
            
            // Remove active class from all categories
            categoryItems.forEach(cat => cat.classList.remove('active'));
            
            // Add active class to clicked category
            item.classList.add('active');
            
            if (category === 'all') {
                displayProducts(allProducts);
            } else {
                const filteredProducts = allProducts.filter(product => 
                    product.category && product.category.toLowerCase() === category.toLowerCase()
                );
                displayProducts(filteredProducts);
            }
        });
    });

    // Single product view function
    const showSingleProductView = (product) => {
        // Hide header and other sections for single product view
        document.querySelector('.header').style.display = 'none';
        document.querySelector('.banner').style.display = 'none';
        document.querySelector('.categories').style.display = 'none';
        document.querySelector('.products').style.display = 'none';
        document.querySelector('.footer').style.display = 'none';
        document.querySelector('.bottom-nav').style.display = 'none';
        
        // Create a back button
        const backButton = document.createElement('div');
        backButton.innerHTML = `
            <div style="padding: 15px; background: #f8f9fa; border-bottom: 1px solid #ddd;">
                <a href="index.html" style="display: inline-flex; align-items: center; text-decoration: none; color: #333;">
                    <i class="fas fa-arrow-left" style="margin-right: 8px;"></i>
                    হোমপেজে ফিরে যান
                </a>
            </div>
        `;
        document.body.insertBefore(backButton, document.body.firstChild);
        
        // Create a container for the single product
        const singleProductContainer = document.createElement('div');
        singleProductContainer.className = 'single-product-view';
        document.querySelector('main').appendChild(singleProductContainer);
        
        // Show the product details
        openProductDetailModal(product);
        
        // Adjust the modal for single product view
        productDetailModal.style.cssText = 'display: block; position: relative; background: none; z-index: 1;';
        productDetailModal.classList.add('single-product-modal');
        document.querySelector('.close-btn').style.display = 'none';
        
        // Move the modal content to the single product container
        singleProductContainer.appendChild(productDetailModal);
    };

    // Initialize the app
    fetchProducts();
});
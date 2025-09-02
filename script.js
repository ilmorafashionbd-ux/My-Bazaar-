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
    const categoryItems = document.querySelectorAll('.category-item');
    const cartPage = document.getElementById('cart-page');
    const cartItemsContainer = document.getElementById('cart-items-container');
    const cartTotalAmount = document.getElementById('cart-total-amount');
    const checkoutBtn = document.getElementById('checkout-btn');
    const cartPageClose = document.getElementById('cart-page-close');
    const cartIconTop = document.getElementById('cart-icon-top');
    const cartIconBottom = document.getElementById('cart-icon-bottom');

    // Check if URL has product ID parameter for single product view
    const urlParams = new URLSearchParams(window.location.search);
    const productIdFromUrl = urlParams.get('product');
    const isSingleProductView = productIdFromUrl !== null;

    // Update cart count display
    const updateCartCount = () => {
        const total = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCountTop.textContent = total;
        cartCountBottom.textContent = total;
    };

    // Save cart to localStorage
    const saveCart = () => {
        localStorage.setItem('cart', JSON.stringify(cart));
    };

    // Add to cart function
    const addToCart = (product, variant = '', quantity = 1) => {
        const existingItemIndex = cart.findIndex(item => 
            item.id === product.id && item.variant === variant
        );

        if (existingItemIndex > -1) {
            cart[existingItemIndex].quantity += quantity;
        } else {
            cart.push({
                id: product.id,
                name: product.product_name,
                price: product.price,
                image: GITHUB_IMAGE_BASE_URL + product.image_url,
                variant: variant,
                quantity: quantity
            });
        }

        saveCart();
        updateCartCount();
        alert(`${product.product_name} ${variant} কার্টে যুক্ত হয়েছে!`);
    };

    // Remove from cart function
    const removeFromCart = (productId, variant = '') => {
        cart = cart.filter(item => !(item.id === productId && item.variant === variant));
        saveCart();
        updateCartCount();
        displayCartItems();
    };

    // Update cart item quantity
    const updateCartQuantity = (productId, variant = '', newQuantity) => {
        const item = cart.find(item => item.id === productId && item.variant === variant);
        if (item) {
            item.quantity = Math.max(1, parseInt(newQuantity));
            saveCart();
            displayCartItems();
        }
    };

    // Display cart items
    const displayCartItems = () => {
        cartItemsContainer.innerHTML = '';
        
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p class="empty-cart">আপনার কার্টে কোন পণ্য নেই</p>';
            cartTotalAmount.textContent = '0';
            return;
        }

        let total = 0;
        
        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            cartItem.innerHTML = `
                <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                <div class="cart-item-details">
                    <h3 class="cart-item-name">${item.name}${item.variant ? ` (${item.variant})` : ''}</h3>
                    <p class="cart-item-price">মূল্য: ${item.price}৳ x ${item.quantity} = ${itemTotal}৳</p>
                    <div class="cart-item-quantity">
                        <button class="quantity-btn decrease" data-id="${item.id}" data-variant="${item.variant}">-</button>
                        <input type="number" value="${item.quantity}" min="1" class="quantity-input" data-id="${item.id}" data-variant="${item.variant}">
                        <button class="quantity-btn increase" data-id="${item.id}" data-variant="${item.variant}">+</button>
                    </div>
                </div>
                <button class="remove-from-cart" data-id="${item.id}" data-variant="${item.variant}">
                    <i class="fas fa-trash"></i>
                </button>
            `;
            cartItemsContainer.appendChild(cartItem);
        });

        cartTotalAmount.textContent = total;

        // Add event listeners to cart item controls
        cartItemsContainer.querySelectorAll('.decrease').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.id;
                const variant = btn.dataset.variant;
                const input = cartItemsContainer.querySelector(`.quantity-input[data-id="${id}"][data-variant="${variant}"]`);
                const newQuantity = parseInt(input.value) - 1;
                
                if (newQuantity >= 1) {
                    input.value = newQuantity;
                    updateCartQuantity(id, variant, newQuantity);
                }
            });
        });

        cartItemsContainer.querySelectorAll('.increase').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.id;
                const variant = btn.dataset.variant;
                const input = cartItemsContainer.querySelector(`.quantity-input[data-id="${id}"][data-variant="${variant}"]`);
                const newQuantity = parseInt(input.value) + 1;
                
                input.value = newQuantity;
                updateCartQuantity(id, variant, newQuantity);
            });
        });

        cartItemsContainer.querySelectorAll('.quantity-input').forEach(input => {
            input.addEventListener('change', () => {
                const id = input.dataset.id;
                const variant = input.dataset.variant;
                const newQuantity = Math.max(1, parseInt(input.value) || 1);
                
                input.value = newQuantity;
                updateCartQuantity(id, variant, newQuantity);
            });
        });

        cartItemsContainer.querySelectorAll('.remove-from-cart').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.id;
                const variant = btn.dataset.variant;
                removeFromCart(id, variant);
            });
        });
    };

    // Open cart page
    const openCartPage = () => {
        displayCartItems();
        cartPage.style.display = 'flex';
        document.body.classList.add('modal-open');
    };

    // Close cart page
    const closeCartPage = () => {
        cartPage.style.display = 'none';
        document.body.classList.remove('modal-open');
    };

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
                    <div class="product-price">${product.price}৳</div>
                    <div class="product-actions">
                        <button class="order-btn" data-id="${product.id}" ${isOutOfStock ? 'disabled' : ''}>
                            <i class="fab fa-whatsapp"></i> হোয়াটসঅ্যাপে অর্ডার
                        </button>
                    </div>
                </div>
            `;
            productGrid.appendChild(productCard);

            // Add event listener for Order button
            productCard.querySelector('.order-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                showOrderForm(product);
            });

            productCard.addEventListener('click', () => {
                // Redirect to single product view
                window.location.href = `index.html?product=${product.id}`;
            });
        });
    };

    // Show single product view when product ID is in URL
    const showSingleProductView = (product) => {
        // Hide elements that are not needed in single product view
        document.querySelector('.banner').style.display = 'none';
        document.querySelector('.categories').style.display = 'none';
        document.querySelector('.section-title').style.display = 'none';
        document.querySelector('.footer').style.marginBottom = '0';
        
        // Change page title
        document.title = `${product.product_name} - Ilmora Fashion BD`;
        
        const mainImageUrl = GITHUB_IMAGE_BASE_URL + product.image_url;
        const otherImages = product.other_images ? product.other_images.split(',').map(img => GITHUB_IMAGE_BASE_URL + img.trim()) : [];
        const allImages = [mainImageUrl, ...otherImages];
        
        // Generate variant options if available
        const variants = product.variants ? product.variants.split(',').map(v => v.trim()) : [];
        const variantOptions = variants.map(v => 
            `<div class="variant-option" data-value="${v}">${v}</div>`
        ).join('');
        
        // Generate related products
        const relatedProducts = allProducts.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);
        const relatedProductsHTML = relatedProducts.map(p => {
            const imgUrl = GITHUB_IMAGE_BASE_URL + p.image_url;
            const isOutOfStock = p.stock_status && p.stock_status.toLowerCase() === 'out of stock';
            
            return `
                <div class="product-card" data-product-id="${p.id}">
                    <div class="product-image">
                        <img src="${imgUrl}" alt="${p.product_name}" 
                            onerror="this.onerror=null;this.src='https://placehold.co/400x400?text=No+Image';">
                        ${isOutOfStock ? `<span class="stock-status">Out of stock</span>` : ''}
                    </div>
                    <div class="product-info">
                        <h3 class="product-name">${p.product_name}</h3>
                        <div class="product-price">${p.price}৳</div>
                        <div class="product-actions">
                            <button class="order-btn" data-id="${p.id}" ${isOutOfStock ? 'disabled' : ''}>
                                <i class="fab fa-whatsapp"></i> হোয়াটসঅ্যাপে অর্ডার
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        // Replace product grid with single product view
        productGrid.innerHTML = `
            <div class="product-detail-premium">
                <div class="product-detail-images">
                    <img id="main-product-image" class="main-image" src="${allImages[0]}" alt="${product.product_name}">
                    ${allImages.length > 1 ? `
                        <div class="thumbnail-images">
                            ${allImages.map((img, i) => `<img class="thumbnail ${i===0?'active':''}" src="${img}" data-img-url="${img}">`).join('')}
                        </div>` : ''}
                </div>
                
                <div class="product-detail-info">
                    <h2 class="product-title">${product.product_name}</h2>
                    
                    <div class="product-meta">
                        <div class="meta-item">
                            <strong>SKU:</strong> <span>${product.sku || 'N/A'}</span>
                        </div>
                        <div class="meta-item">
                            <strong>Category:</strong> <span>${product.category || 'N/A'}</span>
                        </div>
                        <div class="meta-item">
                            <strong>Status:</strong> 
                            <span class="${product.stock_status === 'In Stock' ? 'in-stock' : 'out-of-stock'}">
                                ${product.stock_status || 'In Stock'}
                            </span>
                        </div>
                    </div>
                    
                    <div class="product-price-section">
                        <div class="price-main">${product.price}৳</div>
                        ${product.price_range ? `<div class="price-range">${product.price_range}</div>` : ''}
                    </div>
                    
                    ${variants.length > 0 ? `
                    <div class="variant-selector">
                        <label class="variant-label">Weight / Variant:</label>
                        <div class="variant-options">
                            ${variantOptions}
                        </div>
                    </div>` : ''}
                    
                    <div class="quantity-selector">
                        <span class="quantity-label">Quantity:</span>
                        <div class="quantity-controls">
                            <button class="quantity-btn minus">-</button>
                            <input type="number" class="quantity-input" value="1" min="1">
                            <button class="quantity-btn plus">+</button>
                        </div>
                    </div>
                    
                    <div class="order-buttons">
                        <button class="add-to-cart-detail-btn" id="add-to-cart-detail-btn">
                            <i class="fas fa-cart-plus"></i> Add to Cart
                        </button>
                        <button class="whatsapp-order-btn" id="whatsapp-order-btn">
                            <i class="fab fa-whatsapp"></i> WhatsApp Order
                        </button>
                        <button class="messenger-order-btn" id="messenger-order-btn">
                            <i class="fab fa-facebook-messenger"></i> Messenger Order
                        </button>
                    </div>
                    
                    <div class="product-description">
                        <h3 class="description-title">Product Description</h3>
                        <div class="description-content">
                            ${product.description || 'বিবরণ পাওয়া যায়নি।'}
                        </div>
                    </div>
                </div>
                
                ${relatedProducts.length > 0 ? `
                <div class="related-products">
                    <h3 class="related-title">Related Products</h3>
                    <div class="related-grid">
                        ${relatedProductsHTML}
                    </div>
                </div>
                ` : ''}
                
                <div style="text-align: center; margin-top: 30px;">
                    <a href="index.html" class="order-btn" style="display: inline-block; width: auto; padding: 10px 20px;">
                        <i class="fas fa-arrow-left"></i> সকল পণ্য দেখুন
                    </a>
                </div>
            </div>
        `;
        
        // Thumbnails functionality
        document.querySelectorAll('.thumbnail').forEach(thumb => {
            thumb.addEventListener('click', e => {
                document.getElementById('main-product-image').src = e.target.dataset.imgUrl;
                document.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
                e.target.classList.add('active');
            });
        });

        // Variant selection
        const variantOptionsEl = document.querySelectorAll('.variant-option');
        if (variantOptionsEl.length > 0) {
            variantOptionsEl[0].classList.add('selected');
            
            variantOptionsEl.forEach(option => {
                option.addEventListener('click', () => {
                    variantOptionsEl.forEach(o => o.classList.remove('selected'));
                    option.classList.add('selected');
                });
            });
        }

        // Quantity controls
        const quantityInput = document.querySelector('.quantity-input');
        document.querySelector('.quantity-btn.plus').addEventListener('click', () => {
            quantityInput.value = parseInt(quantityInput.value) + 1;
        });
        
        document.querySelector('.quantity-btn.minus').addEventListener('click', () => {
            if (parseInt(quantityInput.value) > 1) {
                quantityInput.value = parseInt(quantityInput.value) - 1;
            }
        });

        // Add to cart button
        document.querySelector('#add-to-cart-detail-btn').addEventListener('click', () => {
            const selectedVariant = document.querySelector('.variant-option.selected')?.dataset.value || '';
            const quantity = quantityInput.value;
            addToCart(product, selectedVariant, parseInt(quantity));
        });

        // WhatsApp order button
        document.querySelector('#whatsapp-order-btn').addEventListener('click', () => {
            const selectedVariant = document.querySelector('.variant-option.selected')?.dataset.value || '';
            const quantity = quantityInput.value;
            showOrderForm(product, selectedVariant, quantity);
        });

        // Messenger order button
        document.querySelector('#messenger-order-btn').addEventListener('click', () => {
            const selectedVariant = document.querySelector('.variant-option.selected')?.dataset.value || '';
            const quantity = quantityInput.value;
            const productNameWithVariant = `${product.product_name} ${selectedVariant}`;
            
            // Open Facebook Messenger with pre-filled message
            const msg = `I want to order: ${productNameWithVariant} (Quantity: ${quantity})`;
            window.open(`https://m.me/61578353266944?text=${encodeURIComponent(msg)}`, '_blank');
        });

        // Related products click event
        document.querySelectorAll('.related-grid .product-card').forEach(card => {
            card.addEventListener('click', () => {
                const productId = card.dataset.productId;
                // Redirect to the related product's detail page
                window.location.href = `index.html?product=${productId}`;
            });
        });

        // Add event listeners to related product buttons
        document.querySelectorAll('.related-grid .add-to-cart-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const productId = btn.dataset.id;
                const relatedProduct = allProducts.find(p => p.id == productId);
                if (relatedProduct) {
                    addToCart(relatedProduct);
                }
            });
        });

        document.querySelectorAll('.related-grid .order-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const productId = btn.dataset.id;
                const relatedProduct = allProducts.find(p => p.id == productId);
                if (relatedProduct) {
                    showOrderForm(relatedProduct);
                }
            });
        });
    };

    // Show product detail in modal (for homepage)
    const showProductDetailModal = (product) => {
        const mainImageUrl = GITHUB_IMAGE_BASE_URL + product.image_url;
        const otherImages = product.other_images ? product.other_images.split(',').map(img => GITHUB_IMAGE_BASE_URL + img.trim()) : [];
        const allImages = [mainImageUrl, ...otherImages];
        
        // Generate variant options if available
        const variants = product.variants ? product.variants.split(',').map(v => v.trim()) : [];
        const variantOptions = variants.map(v => 
            `<div class="variant-option" data-value="${v}">${v}</div>`
        ).join('');
        
        // Generate related products
        const relatedProducts = allProducts.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);
        const relatedProductsHTML = relatedProducts.map(p => {
            const imgUrl = GITHUB_IMAGE_BASE_URL + p.image_url;
            const isOutOfStock = p.stock_status && p.stock_status.toLowerCase() === 'out of stock';
            
            return `
                <div class="product-card" data-product-id="${p.id}">
                    <div class="product-image">
                        <img src="${imgUrl}" alt="${p.product_name}" 
                            onerror="this.onerror=null;this.src='https://placehold.co/400x400?text=No+Image';">
                        ${isOutOfStock ? `<span class="stock-status">Out of stock</span>` : ''}
                    </div>
                    <div class="product-info">
                        <h3 class="product-name">${p.product_name}</h3>
                        <div class="product-price">${p.price}৳</div>
                        <div class="product-actions">
                            <button class="order-btn" data-id="${p.id}" ${isOutOfStock ? 'disabled' : ''}>
                                <i class="fab fa-whatsapp"></i> হোয়াটসঅ্যাপে অর্ডার
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        productDetailContainer.innerHTML = `
            <div class="product-detail-premium">
                <div class="product-detail-images">
                    <img id="main-product-image" class="main-image" src="${allImages[0]}" alt="${product.product_name}">
                    ${allImages.length > 1 ? `
                        <div class="thumbnail-images">
                            ${allImages.map((img, i) => `<img class="thumbnail ${i===0?'active':''}" src="${img}" data-img-url="${img}">`).join('')}
                        </div>` : ''}
                </div>
                
                <div class="product-detail-info">
                    <h2 class="product-title">${product.product_name}</h2>
                    
                    <div class="product-meta">
                        <div class="meta-item">
                            <strong>SKU:</strong> <span>${product.sku || 'N/A'}</span>
                        </div>
                        <div class="meta-item">
                            <strong>Category:</strong> <span>${product.category || 'N/A'}</span>
                        </div>
                        <div class="meta-item">
                            <strong>Status:</strong> 
                            <span class="${product.stock_status === 'In Stock' ? 'in-stock' : 'out-of-stock'}">
                                ${product.stock_status || 'In Stock'}
                            </span>
                        </div>
                    </div>
                    
                    <div class="product-price-section">
                        <div class="price-main">${product.price}৳</div>
                        ${product.price_range ? `<div class="price-range">${product.price_range}</div>` : ''}
                    </div>
                    
                    ${variants.length > 0 ? `
                    <div class="variant-selector">
                        <label class="variant-label">Weight / Variant:</label>
                        <div class="variant-options">
                            ${variantOptions}
                        </div>
                    </div>` : ''}
                    
                    <div class="quantity-selector">
                        <span class="quantity-label">Quantity:</span>
                        <div class="quantity-controls">
                            <button class="quantity-btn minus">-</button>
                            <input type="number" class="quantity-input" value="1" min="1">
                            <button class="quantity-btn plus">+</button>
                        </div>
                    </div>
                    
                    <div class="order-buttons">
                        <button class="add-to-cart-detail-btn" id="add-to-cart-detail-btn">
                            <i class="fas fa-cart-plus"></i> Add to Cart
                        </button>
                        <button class="whatsapp-order-btn" id="whatsapp-order-btn">
                            <i class="fab fa-whatsapp"></i> WhatsApp Order
                        </button>
                        <button class="messenger-order-btn" id="messenger-order-btn">
                            <i class="fab fa-facebook-messenger"></i> Messenger Order
                        </button>
                    </div>
                    
                    <div class="product-description">
                        <h3 class="description-title">Product Description</h3>
                        <div class="description-content">
                            ${product.description || 'বিবরণ পাওয়া যায়নি।'}
                        </div>
                    </div>
                </div>
                
                ${relatedProducts.length > 0 ? `
                <div class="related-products">
                    <h3 class="related-title">Related Products</h3>
                    <div class="related-grid">
                        ${relatedProductsHTML}
                    </div>
                </div>
                ` : ''}
            </div>
        `;
        
        productDetailModal.style.display = 'block';
        document.body.classList.add('modal-open');

        // Thumbnails functionality
        productDetailContainer.querySelectorAll('.thumbnail').forEach(thumb => {
            thumb.addEventListener('click', e => {
                document.getElementById('main-product-image').src = e.target.dataset.imgUrl;
                productDetailContainer.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
                e.target.classList.add('active');
            });
        });

        // Variant selection
        const variantOptionsEl = productDetailContainer.querySelectorAll('.variant-option');
        if (variantOptionsEl.length > 0) {
            variantOptionsEl[0].classList.add('selected');
            
            variantOptionsEl.forEach(option => {
                option.addEventListener('click', () => {
                    variantOptionsEl.forEach(o => o.classList.remove('selected'));
                    option.classList.add('selected');
                });
            });
        }

        // Quantity controls
        const quantityInput = productDetailContainer.querySelector('.quantity-input');
        productDetailContainer.querySelector('.quantity-btn.plus').addEventListener('click', () => {
            quantityInput.value = parseInt(quantityInput.value) + 1;
        });
        
        productDetailContainer.querySelector('.quantity-btn.minus').addEventListener('click', () => {
            if (parseInt(quantityInput.value) > 1) {
                quantityInput.value = parseInt(quantityInput.value) - 1;
            }
        });

        // Add to cart button
        productDetailContainer.querySelector('#add-to-cart-detail-btn').addEventListener('click', () => {
            const selectedVariant = productDetailContainer.querySelector('.variant-option.selected')?.dataset.value || '';
            const quantity = quantityInput.value;
            addToCart(product, selectedVariant, parseInt(quantity));
            closeProductDetailModal();
        });

        // WhatsApp order button
        productDetailContainer.querySelector('#whatsapp-order-btn').addEventListener('click', () => {
            const selectedVariant = productDetailContainer.querySelector('.variant-option.selected')?.dataset.value || '';
            const quantity = quantityInput.value;
            showOrderForm(product, selectedVariant, quantity);
        });

        // Messenger order button
        productDetailContainer.querySelector('#messenger-order-btn').addEventListener('click', () => {
            const selectedVariant = productDetailContainer.querySelector('.variant-option.selected')?.dataset.value || '';
            const quantity = quantityInput.value;
            const productNameWithVariant = `${product.product_name} ${selectedVariant}`;
            
            // Open Facebook Messenger with pre-filled message
            const msg = `I want to order: ${productNameWithVariant} (Quantity: ${quantity})`;
            window.open(`https://m.me/61578353266944?text=${encodeURIComponent(msg)}`, '_blank');
        });

        // Related products click event
        productDetailContainer.querySelectorAll('.related-grid .product-card').forEach(card => {
            card.addEventListener('click', () => {
                const productId = card.dataset.productId;
                const relatedProduct = allProducts.find(p => p.id == productId);
                if (relatedProduct) {
                    showProductDetailModal(relatedProduct);
                }
            });
        });

        // Add event listeners to related product buttons
        productDetailContainer.querySelectorAll('.related-grid .add-to-cart-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const productId = btn.dataset.id;
                const relatedProduct = allProducts.find(p => p.id == productId);
                if (relatedProduct) {
                    addToCart(relatedProduct);
                }
            });
        });

        productDetailContainer.querySelectorAll('.related-grid .order-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const productId = btn.dataset.id;
                const relatedProduct = allProducts.find(p => p.id == productId);
                if (relatedProduct) {
                    showOrderForm(relatedProduct);
                }
            });
        });

        history.pushState({ modalOpen: true }, '', '#product-' + product.id);
    };

    // Close product modal
    const closeProductDetailModal = () => {
        productDetailModal.style.display = 'none';
        document.body.classList.remove('modal-open');
    };

    productModalCloseBtn.addEventListener('click', closeProductDetailModal);

    window.addEventListener('popstate', e => {
        if (!(e.state && e.state.modalOpen)) closeProductDetailModal();
    });

    // Order form
    const showOrderForm = (product, variant = '', quantity = 1) => {
        const productNameWithVariant = `${product.product_name} ${variant}`.trim();
        document.getElementById('product-name-input').value = productNameWithVariant;
        document.getElementById('product-id-input').value = product.id;
        orderModal.style.display = 'block';
        document.body.classList.add('modal-open');
    };

    document.getElementById('order-modal-close').addEventListener('click', () => {
        orderModal.style.display = 'none';
        document.body.classList.remove('modal-open');
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
            const cat = item.dataset.category;
            const filtered = cat === 'all' ? allProducts : allProducts.filter(p => p.category && p.category.toLowerCase().replace(/\s/g,'-') === cat);
            displayProducts(filtered);
        });
    });

    // Cart page events
    cartIconTop.addEventListener('click', openCartPage);
    cartIconBottom.addEventListener('click', openCartPage);
    cartPageClose.addEventListener('click', closeCartPage);

    // Checkout button event
    checkoutBtn.addEventListener('click', () => {
        if (cart.length === 0) {
            alert('আপনার কার্টে কোন পণ্য নেই!');
            return;
        }

        let message = 'আমি নিম্নলিখিত পণ্যগুলো অর্ডার করতে চাই:\n\n';
        let total = 0;
        
        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            message += `*${item.name}${item.variant ? ` (${item.variant})` : ''}*\nপরিমাণ: ${item.quantity}\nমূল্য: ${item.price}৳ x ${item.quantity} = ${itemTotal}৳\n\n`;
        });
        
        message += `*মোট মূল্য: ${total}৳*`;
        
        const encodedMessage = encodeURIComponent(message);
        window.open(`https://wa.me/8801778095805?text=${encodedMessage}`, '_blank');
    });

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
            document.body.classList.remove('modal-open');
        }
    });

    // Initialize cart count
    updateCartCount();

    // Init
    fetchProducts();
});
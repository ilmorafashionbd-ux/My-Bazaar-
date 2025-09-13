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

    // Function to parse CSV
    async function fetchAndParseCSV() {
        try {
            const response = await fetch(csvUrl);
            const data = await response.text();
            allProducts = parseCSV(data);
            displayProducts(allProducts);
        } catch (error) {
            console.error('Error fetching CSV:', error);
        }
    }

    function parseCSV(csv) {
        const lines = csv.split('\n').map(line => line.trim()).filter(line => line);
        if (lines.length === 0) return [];
        const headers = lines[0].split(',').map(header => header.trim().toLowerCase());
        const products = [];
        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map(value => value.trim());
            const product = {};
            headers.forEach((header, index) => {
                let value = values[index] || '';
                // Clean up string values by removing quotes if present
                if (value.startsWith('"') && value.endsWith('"')) {
                    value = value.substring(1, value.length - 1);
                }
                if (header === 'price' || header === 'original_price') {
                    product[header] = parseFloat(value) || 0;
                } else if (header === 'images') {
                    product[header] = value;
                } else {
                    product[header] = value;
                }
            });
            products.push(product);
        }
        return products;
    }

    // Function to display products
    function displayProducts(products) {
        if (!productGrid) return;
        productGrid.innerHTML = '';
        products.forEach(product => {
            const productItem = document.createElement('div');
            productItem.className = 'product-item';
            productItem.dataset.sku = product.sku;
            productItem.innerHTML = `
                <div class="product-item-img-container">
                    <img src="${GITHUB_IMAGE_BASE_URL}${product.images.split(',')[0].trim()}" alt="${product.title}">
                </div>
                <div class="product-item-info">
                    <h3 class="product-item-title">${product.title}</h3>
                    <p class="product-item-price">${product.price}৳</p>
                    <button class="product-item-btn">বিস্তারিত দেখুন</button>
                </div>
            `;
            productGrid.appendChild(productItem);
        });

        document.querySelectorAll('.product-item-btn').forEach(button => {
            button.addEventListener('click', e => {
                e.preventDefault();
                const sku = e.target.closest('.product-item').dataset.sku;
                const product = allProducts.find(p => p.sku === sku);
                if (product) {
                    showProductDetail(product);
                }
            });
        });
    }

    // Function to show product detail modal
    function showProductDetail(product) {
        if (!product || !document.getElementById('product-detail-container')) return;

        // Set up the new product detail page
        setupProductDetailPage(product);
        
        // Hide the main product grid section and show the product detail section
        document.getElementById('products').style.display = 'block';
        document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
        
        // You might need to hide other sections if this is a single page application
        // For example:
        // document.getElementById('home').style.display = 'none';
        // document.getElementById('category').style.display = 'none';
    }

    // Add to cart functionality
    function addToCart(product) {
        const existingItem = cart.find(item => item.sku === product.sku);
        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({ ...product,
                quantity: 1
            });
        }
        updateCartCount();
    }

    // Update cart count display
    function updateCartCount() {
        const count = cart.reduce((total, item) => total + item.quantity, 0);
        cartCountTop.textContent = count;
        cartCountBottom.textContent = count;
    }

    // Show order modal
    const showOrderModal = (product) => {
        document.getElementById('product-name-input').value = product.title;
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
            const filtered = cat === 'all' ? allProducts : allProducts.filter(p => p.category && p.category.toLowerCase().replace(/\s/g, '-') === cat);
            displayProducts(filtered);
        });
    });

    // Initial data fetch
    fetchAndParseCSV();

    /* ========================================================= */
    /* New Functions for Product Detail Page (to be added) */
    /* ========================================================= */

    // New function to handle the entire product detail page logic
    const setupProductDetailPage = (product) => {
        // Selectors
        const mainImage = document.getElementById('main-product-image');
        const thumbnailStrip = document.getElementById('thumbnail-strip');
        const productTitle = document.getElementById('product-title');
        const discountPrice = document.getElementById('discount-price');
        const originalPrice = document.getElementById('original-price');
        const productCode = document.getElementById('product-code');
        const sizeOptionsContainer = document.getElementById('size-options');
        const quantityInput = document.getElementById('quantity-input');
        const plusBtn = document.querySelector('.plus-btn');
        const minusBtn = document.querySelector('.minus-btn');
        const whatsappBtn = document.getElementById('whatsapp-order-btn');
        const messengerBtn = document.getElementById('messenger-order-btn');
        const productDescContent = document.getElementById('product-description-content');
    
        // Display product details
        productTitle.textContent = product.title || 'Product Title';
        productCode.textContent = `PCode: ${product.sku || 'N/A'}`;
        productDescContent.innerHTML = product.description || '';
    
        // Handle price display
        if (product.original_price && product.original_price > product.price) {
            discountPrice.textContent = `${product.price}৳`;
            originalPrice.textContent = `${product.original_price}৳`;
            originalPrice.style.display = 'inline'; // Make sure it's visible
        } else {
            discountPrice.textContent = `${product.price}৳`;
            originalPrice.style.display = 'none';
        }
    
        // Image Gallery
        const images = product.images.split(',').map(img => img.trim());
        let currentImageIndex = 0;
    
        const updateMainImage = (index) => {
            mainImage.src = GITHUB_IMAGE_BASE_URL + images[index];
            const thumbnails = thumbnailStrip.querySelectorAll('img');
            thumbnails.forEach((thumb, i) => {
                thumb.classList.toggle('active', i === index);
            });
            currentImageIndex = index;
        };
    
        const buildThumbnails = () => {
            thumbnailStrip.innerHTML = '';
            images.forEach((img, index) => {
                const thumb = document.createElement('img');
                thumb.src = GITHUB_IMAGE_BASE_URL + img;
                thumb.alt = `Thumbnail ${index + 1}`;
                thumb.addEventListener('click', () => updateMainImage(index));
                thumbnailStrip.appendChild(thumb);
            });
            updateMainImage(0);
        };
        
        // Swipe functionality for mobile
        let touchStartX = 0;
        mainImage.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
        });
        mainImage.addEventListener('touchend', (e) => {
            const touchEndX = e.changedTouches[0].clientX;
            const deltaX = touchEndX - touchStartX;
            if (deltaX > 50) { // Swiped right
                currentImageIndex = (currentImageIndex > 0) ? currentImageIndex - 1 : images.length - 1;
            } else if (deltaX < -50) { // Swiped left
                currentImageIndex = (currentImageIndex < images.length - 1) ? currentImageIndex + 1 : 0;
            }
            updateMainImage(currentImageIndex);
        });
    
        // Size Selection
        let selectedSize = '';
        const sizes = product.sizes ? product.sizes.split(',').map(s => s.trim()) : [];
        if (sizes.length > 0) {
            sizeOptionsContainer.innerHTML = ''; // Clear previous sizes
            sizes.forEach(size => {
                const sizeBtn = document.createElement('button');
                sizeBtn.className = 'size-option-btn';
                sizeBtn.textContent = size;
                sizeBtn.dataset.size = size;
                sizeBtn.addEventListener('click', () => {
                    document.querySelectorAll('.size-option-btn').forEach(btn => btn.classList.remove('active'));
                    sizeBtn.classList.add('active');
                    selectedSize = size;
                });
                sizeOptionsContainer.appendChild(sizeBtn);
            });
            document.querySelector('.product-options .option-group').style.display = 'block';
        } else {
            document.querySelector('.product-options .option-group').style.display = 'none';
        }
        
        // Quantity Selector
        plusBtn.addEventListener('click', () => {
            let currentQty = parseInt(quantityInput.value);
            quantityInput.value = currentQty + 1;
        });
    
        minusBtn.addEventListener('click', () => {
            let currentQty = parseInt(quantityInput.value);
            if (currentQty > 1) {
                quantityInput.value = currentQty - 1;
            }
        });
    
        // WhatsApp Order Button
        whatsappBtn.addEventListener('click', () => {
            const orderMessage = `🛒 নতুন অর্ডার!\n\nপণ্যের নাম: ${productTitle.textContent}\nID: ${productCode.textContent}\nসাইজ: ${selectedSize || 'N/A'}\nপরিমাণ: ${quantityInput.value}\n\nআপনার ঠিকানা ও মোবাইল নম্বর দিন।`;
            window.open(`https://wa.me/8801778095805?text=${encodeURIComponent(orderMessage)}`, '_blank');
        });
    
        // Messenger Order Button
        messengerBtn.href = 'https://www.facebook.com/messages/t/61578353266944';
    
        // Initial build
        buildThumbnails();
    };
});
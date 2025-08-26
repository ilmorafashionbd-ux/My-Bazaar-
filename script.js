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
    // Google Sheet-এর CSV URL
    const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRvJSc-B0_uG9Yt1QOMq6Kcq0ccW4dbztEFeRXUYqZIIWvVQWhG4NrcHXB4WBq-5G2JXHRuz7lpbDGK/pub?gid=0&single=true&output=csv';

    // GitHub repository-এর বেস URL যেখানে ছবিগুলো রাখা আছে
    const GITHUB_IMAGE_BASE_URL = 'https://ilmorafashionbd-ux.github.io/My-Bazaar-/images/';

    let allProducts = [];
    let cart = [];

    // Selectors for elements
    const productGrid = document.getElementById('product-grid');
    const productDetailModal = document.getElementById('product-detail-modal');
    const orderModal = document.getElementById('order-modal');
    const productDetailContainer = document.getElementById('product-detail-container');
    const productModalCloseBtn = document.getElementById('product-modal-close');
    const orderForm = document.getElementById('order-form');
    const cartCountTop = document.querySelector('.cart-count');
    const cartCountBottom = document.querySelector('.cart-count-bottom');
    const categoryItems = document.querySelectorAll('.category-item');

    // Function to fetch products from Google Sheet CSV
    const fetchProducts = async () => {
        try {
            const response = await fetch(csvUrl);
            const text = await response.text();
            Papa.parse(text, {
                header: true,
                dynamicTyping: true,
                complete: (results) => {
                    allProducts = results.data.filter(product => product.id); // Filter out empty rows
                    if (allProducts.length > 0) {
                        displayProducts(allProducts);
                    } else {
                        console.error('No products found in the CSV data.');
                    }
                },
                error: (error) => {
                    console.error('Error parsing CSV:', error);
                }
            });
        } catch (error) {
            console.error('Failed to fetch products:', error);
        }
    };

    // Function to render products on the page
    const displayProducts = (productsToDisplay) => {
        productGrid.innerHTML = '';
        if (productsToDisplay.length === 0) {
            productGrid.innerHTML = '<p>এই ক্যাটাগরিতে কোনো পণ্য নেই।</p>';
            return;
        }

        productsToDisplay.forEach(product => {
            if (!product.id || !product.product_name || !product.price || !product.image_url) {
                return;
            }

            // GitHub থেকে ছবির সম্পূর্ণ URL তৈরি করা
            const mainImageUrl = GITHUB_IMAGE_BASE_URL + product.image_url;

            const productCard = document.createElement('div');
            productCard.classList.add('product-card');
            productCard.dataset.productId = product.id;

            const isOutOfStock = product.stock_status && product.stock_status.toLowerCase() === 'out of stock';
            
            const priceHtml = product.sale_price ?
                `<span style="text-decoration: line-through; color: #aaa; margin-right: 5px;">${product.price}৳</span>` +
                `<span style="color: red; font-size: 18px;">${product.sale_price}৳</span>` :
                `<span style="font-size: 18px;">${product.price}৳</span>`;

            productCard.innerHTML = `
                <div class="product-image">
                    <img src="${mainImageUrl}" alt="${product.product_name}" onerror="this.onerror=null;this.src='https://placehold.co/400x400/CCCCCC/000000?text=No+Image';">
                    ${isOutOfStock ? `<span class="stock-status">Out of stock</span>` : ''}
                </div>
                <div class="product-info">
                    <h3 class="product-name">${product.product_name}</h3>
                    <div class="product-price">
                        ${priceHtml}
                    </div>
                </div>
            `;
            productGrid.appendChild(productCard);
        });

        // Add event listeners to newly created product cards
        document.querySelectorAll('.product-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const productId = e.currentTarget.dataset.productId;
                const product = allProducts.find(p => p.id == productId);
                if (product) {
                    showProductDetail(product);
                }
            });
        });
    };

    // Function to show product detail modal
    const showProductDetail = (product) => {
        // GitHub থেকে ছবির URL তৈরি করা
        const mainImageUrl = GITHUB_IMAGE_BASE_URL + product.image_url;
        const otherImages = product.other_images ? 
            product.other_images.split(',').map(img => GITHUB_IMAGE_BASE_URL + img.trim()) : [];

        const allImages = [mainImageUrl, ...otherImages].filter(url => url.endsWith('/') === false);

        productDetailContainer.innerHTML = `
            <div class="product-detail-layout">
                <div class="product-detail-images">
                    <img id="main-product-image" class="main-image" src="${allImages[0] || 'https://placehold.co/400x400/CCCCCC/000000?text=No+Image'}" alt="${product.product_name}">
                    ${allImages.length > 1 ? `
                    <div class="thumbnail-images">
                        ${allImages.map((img, index) => `
                            <img class="thumbnail" src="${img}" alt="Thumbnail ${index + 1}" data-img-url="${img}">
                        `).join('')}
                    </div>
                    ` : ''}
                </div>
                <div class="product-detail-info">
                    <h2>${product.product_name}</h2>
                    <div class="product-price">মূল্য: ${product.price}৳</div>
                    <div class="product-description">
                        <h3>পণ্যের বিবরণ:</h3>
                        <p>${product.description || 'এই পণ্যের কোনো বিবরণ নেই।'}</p>
                    </div>
                    <button class="order-btn" id="add-to-cart-btn" data-product-id="${product.id}" data-product-name="${product.product_name}">কার্টে যুক্ত করুন</button>
                    <button class="order-btn" id="buy-now-btn" data-product-id="${product.id}">এখনই কিনুন</button>
                </div>
            </div>
        `;
        productDetailModal.style.display = 'block';
        document.body.classList.add('modal-open');

        // Handle thumbnail image click
        const thumbnails = productDetailContainer.querySelectorAll('.thumbnail');
        const mainImage = document.getElementById('main-product-image');
        thumbnails.forEach(thumb => {
            thumb.addEventListener('click', (e) => {
                mainImage.src = e.target.dataset.imgUrl;
                thumbnails.forEach(t => t.classList.remove('active'));
                e.target.classList.add('active');
            });
        });
        if (thumbnails.length > 0) thumbnails[0].classList.add('active');

        // Add event listeners to the new buttons
        document.getElementById('add-to-cart-btn').addEventListener('click', () => {
            addToCart(product);
        });

        document.getElementById('buy-now-btn').addEventListener('click', () => {
             showOrderForm(product);
        });
    };

    // Function to add a product to the cart
    const addToCart = (product) => {
        const existingItem = cart.find(item => item.id === product.id);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({ ...product, quantity: 1 });
        }
        updateCartCount();
        alert(`${product.product_name} কার্টে যুক্ত হয়েছে।`);
    };
    
    // Function to show order form modal
    const showOrderForm = (product) => {
        document.getElementById('product-name-input').value = product.product_name;
        document.getElementById('product-id-input').value = product.id;
        orderModal.style.display = 'block';
        productDetailModal.style.display = 'none'; // Close product detail modal
    };

    // Function to close the product detail modal
    const closeProductDetailModal = () => {
        productDetailModal.style.display = 'none';
        document.body.classList.remove('modal-open');
    };

    // Function to close the order form modal
    const closeOrderModal = () => {
        orderModal.style.display = 'none';
        document.body.classList.remove('modal-open');
    };

    // Function to update the cart count display
    const updateCartCount = () => {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCountTop.textContent = totalItems;
        cartCountBottom.textContent = totalItems;
    };

    // Event listeners for modals
    productModalCloseBtn.addEventListener('click', closeProductDetailModal);
    document.getElementById('order-modal-close').addEventListener('click', closeOrderModal);

    window.addEventListener('click', (event) => {
        if (event.target === productDetailModal) {
            closeProductDetailModal();
        }
        if (event.target === orderModal) {
            closeOrderModal();
        }
    });

    // Event listener for category filtering
    categoryItems.forEach(item => {
        item.addEventListener('click', (e) => {
            const category = e.currentTarget.dataset.category;
            let filteredProducts;
            if (category === 'all') {
                filteredProducts = allProducts;
            } else {
                filteredProducts = allProducts.filter(p => p.category && p.category.toLowerCase().replace(/\s/g, '-') === category);
            }
            displayProducts(filteredProducts);
        });
    });

    // Handle order form submission
    orderForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const productName = document.getElementById('product-name-input').value;
        const productId = document.getElementById('product-id-input').value;
        const customerName = document.getElementById('customer-name').value;
        const customerAddress = document.getElementById('customer-address').value;
        const customerMobile = document.getElementById('customer-mobile').value;

        const productLink = window.location.href.split('#')[0] + `?product=${productId}`;

        const whatsappMessage = `*New Order!*\n\n*Product Name:* ${productName}\n*Product ID:* ${productId}\n*Product Link:* ${productLink}\n\n*Customer Details:*\nName: ${customerName}\nAddress: ${customerAddress}\nMobile: ${customerMobile}`;

        const encodedMessage = encodeURIComponent(whatsappMessage);
        window.open(`https://wa.me/8801778095805?text=${encodedMessage}`, '_blank');
        
        closeOrderModal();
        orderForm.reset();
    });

    // Initial product fetch on page load
    fetchProducts();
});

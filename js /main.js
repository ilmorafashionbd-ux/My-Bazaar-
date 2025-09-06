document.addEventListener("DOMContentLoaded", () => {
    const productList = document.getElementById('product-list');
    const cartCount = document.getElementById('cart-count');

    // Fetch products from Google Sheets CSV
    const csvUrl = "YOUR_GOOGLE_SHEET_CSV_LINK_HERE"; // আপনার CSV লিংক এখানে দিন

    Papa.parse(csvUrl, {
        download: true,
        header: true,
        skipEmptyLines: true,
        complete: function(results) {
            const products = results.data;
            displayProducts(products);
        }
    });

    function displayProducts(products) {
        products.forEach(product => {
            const productCard = document.createElement('div');
            productCard.classList.add('product-card');
            productCard.innerHTML = `
                <img src="${product.imagePath}" alt="${product.name}">
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <p class="product-price">৳${product.price}</p>
                    <a href="product-details.html?id=${product.id}" class="btn-view-details">বিস্তারিত দেখুন</a>
                    <button class="btn-add-to-cart" data-product-id="${product.id}" data-product-name="${product.name}" data-product-price="${product.price}">কার্টে যোগ করুন</button>
                </div>
            `;
            productList.appendChild(productCard);
        });

        // Add to cart functionality
        document.querySelectorAll('.btn-add-to-cart').forEach(button => {
            button.addEventListener('click', (e) => {
                const productId = e.target.dataset.productId;
                const productName = e.target.dataset.productName;
                const productPrice = e.target.dataset.productPrice;

                const cart = JSON.parse(localStorage.getItem('cart')) || [];
                
                const existingProduct = cart.find(item => item.id === productId);
                if (existingProduct) {
                    existingProduct.quantity++;
                } else {
                    cart.push({ id: productId, name: productName, price: productPrice, quantity: 1 });
                }

                localStorage.setItem('cart', JSON.stringify(cart));
                updateCartCount();
                alert(`${productName} আপনার কার্টে যোগ করা হয়েছে!`);
            });
        });
    }

    function updateCartCount() {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
    }

    updateCartCount();
});


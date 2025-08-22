document.addEventListener("DOMContentLoaded", () => {
    const productContainer = document.getElementById('product-container');
    const cartCountElement = document.getElementById('cart-count');
    const cartItemsContainer = document.getElementById('cart-items-container');
    const orderForm = document.getElementById('order-form');
    
    let products = [];
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRPm9-h3hnXGp1r7HBXl6qam4_s8v1SNKnp0Xwa-VdrxJXRRaQihnxKl51fIGuLF6I4VLhGRZ0cHAv9/pub?gid=0&single=true&output=csv';
    const imageBaseUrl = 'https://ilmorafashionbd-ux.github.io/My-Bazaar-/images/';
    const whatsappNumber = '8801778095805'; // Country code included

    // 1. Fetch and Parse CSV Data
    const fetchProducts = async () => {
        try {
            const response = await fetch(csvUrl);
            const csvText = await response.text();
            products = parseCSV(csvText);
            displayProducts();
        } catch (error) {
            console.error("Error fetching product data:", error);
            productContainer.innerHTML = '<p class="text-center text-danger">Failed to load products. Please try again later.</p>';
        }
    };
    
    const parseCSV = (text) => {
        const rows = text.split(/\r?\n/).filter(row => row.trim() !== '');
        if (rows.length < 2) return [];
        const headers = rows[0].split(',').map(header => header.trim());
        const data = rows.slice(1).map(row => {
            const values = row.split(',');
            return headers.reduce((obj, header, index) => {
                obj[header] = values[index] ? values[index].trim() : '';
                return obj;
            }, {});
        });
        return data;
    };

    // 2. Display Products
    const displayProducts = () => {
        productContainer.innerHTML = '';
        products.forEach((product, index) => {
            const isSale = product.on_sale && product.on_sale.toLowerCase() === 'true';
            
            const card = document.createElement('div');
            card.className = 'col mb-5';
            card.innerHTML = `
                <div class="card h-100">
                    ${isSale ? '<div class="badge bg-dark text-white position-absolute" style="top: 0.5rem; right: 0.5rem">Sale</div>' : ''}
                    <img class="card-img-top" src="${imageBaseUrl}${product.image_name}" alt="${product.name}" />
                    <div class="card-body p-4">
                        <div class="text-center">
                            <h5 class="fw-bolder">${product.name}</h5>
                            ${isSale
                                ? `<span class="text-muted text-decoration-line-through">$${product.price}</span> $${product.sale_price}`
                                : `$${product.price}`
                            }
                        </div>
                    </div>
                    <div class="card-footer p-4 pt-0 border-top-0 bg-transparent">
                        <div class="text-center">
                            <a href="#" class="btn btn-outline-dark mt-auto" onclick="addToCart(${index})">Add to cart</a>
                        </div>
                    </div>
                </div>
            `;
            productContainer.appendChild(card);
        });
    };

    // 3. Cart Functionality
    window.addToCart = (productIndex) => {
        const product = products[productIndex];
        const existingItem = cart.find(item => item.name === product.name);

        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({ ...product, quantity: 1 });
        }
        
        updateCart();
    };

    const updateCart = () => {
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        displayCartItems();
    };

    const updateCartCount = () => {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCountElement.innerText = totalItems;
    };

    const displayCartItems = () => {
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p>Your cart is empty.</p>';
            return;
        }

        let total = 0;
        cartItemsContainer.innerHTML = `
            <div class="table-responsive">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Price</th>
                            <th>Quantity</th>
                            <th>Total</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${cart.map((item, index) => {
                            const itemPrice = (item.on_sale && item.on_sale.toLowerCase() === 'true') ? parseFloat(item.sale_price) : parseFloat(item.price);
                            const itemTotal = item.quantity * itemPrice;
                            total += itemTotal;
                            return `
                                <tr>
                                    <td>${item.name}</td>
                                    <td>$${itemPrice.toFixed(2)}</td>
                                    <td>${item.quantity}</td>
                                    <td>$${itemTotal.toFixed(2)}</td>
                                    <td><button class="btn btn-danger btn-sm" onclick="removeFromCart(${index})">Remove</button></td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
            <h4 class="text-end">Grand Total: $${total.toFixed(2)}</h4>
        `;
    };

    window.removeFromCart = (index) => {
        cart.splice(index, 1);
        updateCart();
    };
    
    // 4. Order Submission
    orderForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        if (cart.length === 0) {
            alert("Your cart is empty. Please add some products before placing an order.");
            return;
        }

        const name = document.getElementById('fullName').value;
        const phone = document.getElementById('phoneNumber').value;
        const address = document.getElementById('fullAddress').value;

        let totalAmount = 0;
        let orderDetails = cart.map(item => {
            const price = (item.on_sale && item.on_sale.toLowerCase() === 'true') ? parseFloat(item.sale_price) : parseFloat(item.price);
            totalAmount += item.quantity * price;
            return `- ${item.name} - ${item.quantity} x $${price.toFixed(2)}`;
        }).join('\n');

        const message = `
New Order Received!

*Customer Details:*
Name: ${name}
Phone: ${phone}
Address: ${address}

*Order Details:*
${orderDetails}

*Total Amount: $${totalAmount.toFixed(2)}*
        `;

        const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
        
        // Redirect to WhatsApp
        window.open(whatsappUrl, '_blank');
        
        // Clear cart and form after submission
        cart = [];
        updateCart();
        orderForm.reset();
        
        // Close the modal
        const cartModal = bootstrap.Modal.getInstance(document.getElementById('cartModal'));
        if (cartModal) {
            cartModal.hide();
        }
    });

    // Initial Load
    fetchProducts();
    updateCart();
    // Add event listener to display cart items when modal is shown
    document.getElementById('cartModal').addEventListener('show.bs.modal', displayCartItems);
});
// Load products from localStorage
let products = JSON.parse(localStorage.getItem("products")) || [];
let categories = JSON.parse(localStorage.getItem("categories")) || [];
let banners = JSON.parse(localStorage.getItem("banners")) || [];
let cart = JSON.parse(localStorage.getItem("cart")) || [];

// Save helper
function saveData() {
  localStorage.setItem("products", JSON.stringify(products));
  localStorage.setItem("categories", JSON.stringify(categories));
  localStorage.setItem("banners", JSON.stringify(banners));
  localStorage.setItem("cart", JSON.stringify(cart));
}

// ============================
// Product List Rendering
// ============================
function renderProducts() {
  const grid = document.querySelector(".product-grid");
  if (!grid) return;

  grid.innerHTML = "";
  products.forEach((p, i) => {
    let div = document.createElement("div");
    div.className = "product-card";
    div.innerHTML = `
      <img src="${p.images?.[0] || ''}" alt="${p.name}">
      <h3>${p.name}</h3>
      <p>${p.description.substring(0, 60)}...</p>
      <p><strong>${p.price} BDT</strong></p>
      <button onclick="viewProduct(${i})">View</button>
    `;
    grid.appendChild(div);
  });
}

// Redirect to product details
function viewProduct(index) {
  localStorage.setItem("viewProductIndex", index);
  window.location.href = "product_details.html";
}

// ============================
// Product Detail Page
// ============================
function loadProductDetail() {
  const index = localStorage.getItem("viewProductIndex");
  if (index === null) return;

  const product = products[index];
  if (!product) return;

  document.getElementById("productTitle").textContent = product.name;
  document.getElementById("productDescription").textContent = product.description;
  document.getElementById("productPrice").textContent = product.price;

  const mainImg = document.getElementById("mainProductImage");
  mainImg.src = product.images?.[0] || "";

  const thumbs = document.getElementById("thumbnailContainer");
  thumbs.innerHTML = "";
  product.images.forEach((img, idx) => {
    let t = document.createElement("img");
    t.src = img;
    if (idx === 0) t.classList.add("active");
    t.onclick = () => {
      mainImg.src = img;
      document.querySelectorAll("#thumbnailContainer img").forEach(x => x.classList.remove("active"));
      t.classList.add("active");
    };
    thumbs.appendChild(t);
  });

  document.getElementById("addToCartBtn").onclick = () => {
    cart.push(product);
    saveData();
    alert("Added to cart!");
  };
}

// ============================
// Cart
// ============================
function renderCart() {
  const cartItems = document.getElementById("cartItems");
  if (!cartItems) return;

  cartItems.innerHTML = "";
  let total = 0;

  cart.forEach((item, i) => {
    total += parseFloat(item.price);
    let div = document.createElement("div");
    div.className = "cart-item";
    div.innerHTML = `
      <img src="${item.images?.[0] || ''}" alt="${item.name}">
      <span>${item.name}</span>
      <span>${item.price} BDT</span>
      <button onclick="removeCartItem(${i})">Remove</button>
    `;
    cartItems.appendChild(div);
  });

  document.getElementById("totalAmount").textContent = total;
}

function removeCartItem(index) {
  cart.splice(index, 1);
  saveData();
  renderCart();
}

// ============================
// Admin Panel
// ============================
const addProductForm = document.getElementById("addProductForm");
if (addProductForm) {
  addProductForm.onsubmit = (e) => {
    e.preventDefault();
    const name = document.getElementById("productName").value;
    const description = document.getElementById("productDescription").value;
    const price = document.getElementById("productPrice").value;
    const category = document.getElementById("productCategory").value;

    const imagesInput = document.getElementById("productImages");
    let images = [];
    for (let file of imagesInput.files) {
      images.push(URL.createObjectURL(file));
    }

    products.push({ name, description, price, category, images });
    saveData();
    alert("Product Added!");
    addProductForm.reset();
  };
}

// Category Management
const categoryForm = document.getElementById("categoryForm");
if (categoryForm) {
  categoryForm.onsubmit = (e) => {
    e.preventDefault();
    const newCat = document.getElementById("newCategory").value.trim();
    if (newCat && !categories.includes(newCat)) {
      categories.push(newCat);
      saveData();
      renderCategories();
    }
    categoryForm.reset();
  };
}

function renderCategories() {
  const list = document.getElementById("categoryList");
  if (!list) return;

  list.innerHTML = "";
  categories.forEach((c, i) => {
    let div = document.createElement("div");
    div.className = "category-item";
    div.innerHTML = `
      <span>${c}</span>
      <button onclick="removeCategory(${i})">Delete</button>
    `;
    list.appendChild(div);
  });
}

function removeCategory(i) {
  categories.splice(i, 1);
  saveData();
  renderCategories();
}

// Banner Management
const bannerForm = document.getElementById("bannerForm");
if (bannerForm) {
  bannerForm.onsubmit = (e) => {
    e.preventDefault();
    const bannerInput = document.getElementById("bannerImages");
    banners = [];
    for (let file of bannerInput.files) {
      banners.push(URL.createObjectURL(file));
    }
    saveData();
    alert("Banner Updated!");
  };
}

// ============================
// Init
// ============================
document.addEventListener("DOMContentLoaded", () => {
  renderProducts();
  loadProductDetail();
  renderCart();
  renderCategories();
});
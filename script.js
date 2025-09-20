/*********************************************
  script.js
  - Handles both index.html (public shop) and admin.html (admin UI)
  - Uses Firebase (Auth + Firestore) and Cloudinary (image upload)
  - Added: single product page render (keeps header/footer)
*********************************************/

/* =======================
   1) CONFIG - Firebase + Cloudinary
   ========================= */
const firebaseConfig = {
  apiKey: "AIzaSyBUpr0ZmggaDukSVIoXeckeTVy09bK6_0s",
  authDomain: "my-shop-app-15b82.firebaseapp.com",
  projectId: "my-shop-app-15b82",
  storageBucket: "my-shop-app-15b82.firebasestorage.app",
  messagingSenderId: "343254203665",
  appId: "1:343254203665:web:ebeaa0c96837384a8ba0b0"
};
const CLOUDINARY_CLOUD = "durtzerpq";
const CLOUDINARY_UPLOAD_PRESET = "product_images";

/* Initialize Firebase (compat libs must be loaded in HTML) */
if (typeof firebase === 'undefined') {
  console.error('Firebase SDK not loaded.');
} else {
  firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();
const db = firebase.firestore();

/* Helpers */
const $ = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));
const page = document.body.dataset.page || 'index';

/* CART (localStorage) */
const CART_KEY = 'myshop_cart_v1';
function getCart(){ try{ return JSON.parse(localStorage.getItem(CART_KEY)) || []; }catch(e){ return []; } }
function saveCart(c){ localStorage.setItem(CART_KEY, JSON.stringify(c)); updateCartCount(); }
function updateCartCount(){ const c = getCart(); const total = c.reduce((s,i)=>s+ (i.qty||1), 0); const el = document.getElementById('cart-count'); if(el) el.textContent = total; }

/* Cloudinary upload (unsigned) */
async function uploadToCloudinary(file){
  if(!file) throw new Error('No file provided');
  const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/upload`;
  const form = new FormData();
  form.append('file', file);
  form.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
  const res = await fetch(url, { method: 'POST', body: form });
  if(!res.ok) throw new Error('Cloudinary upload failed: '+res.statusText);
  const data = await res.json();
  return data.secure_url || data.url;
}

/* Modals */
function showModal(htmlContent, modalId){
  const id = modalId || 'product-modal';
  const modal = document.getElementById(id);
  if(!modal) return;
  if(id === 'product-modal'){
    const pm = modal.querySelector('#product-modal-inner');
    if(pm) pm.innerHTML = htmlContent;
  } else if(id === 'cart-modal'){
    const cm = modal.querySelector('#cart-inner');
    if(cm) cm.innerHTML = htmlContent;
  }
  modal.style.display = 'flex';
}
function closeModal(id='product-modal'){ const modal = document.getElementById(id); if(modal) modal.style.display = 'none'; }
document.addEventListener('click', (e)=>{ if(e.target.matches('.modal-close')) { const parent = e.target.closest('.modal'); if(parent) parent.style.display='none'; } if(e.target.classList && e.target.classList.contains('modal')) { e.target.style.display='none'; } });

/* Utility */
function escapeHtml(s){ if(!s) return ''; return String(s).replace(/[&<>"]/g, (c)=> ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }

/* ============ INDEX PAGE LOGIC ============= */
async function initIndexPage(){
  const grid = document.getElementById('product-grid');
  const noProducts = document.getElementById('no-products');
  const productModalClose = document.getElementById('product-modal-close');
  const cartClose = document.getElementById('cart-modal-close');
  if(productModalClose) productModalClose.onclick = ()=> closeModal('product-modal');
  if(cartClose) cartClose.onclick = ()=> closeModal('cart-modal');

  const cartBtn = document.getElementById('cart-open-btn');
  if(cartBtn) cartBtn.addEventListener('click', ()=> renderCartModal());
  updateCartCount();

  // Fetch products from Firestore
  try{
    const snap = await db.collection('products').orderBy('createdAt','desc').get();
    if(snap.empty){ if(noProducts) noProducts.style.display='block'; return; }
    const products = snap.docs.map(d=> ({ id:d.id, ...d.data() }) );
    renderProductsGrid(products);
    // If URL has ?product=ID, show single product page (keeps header/footer)
    const params = new URLSearchParams(window.location.search);
    const pid = params.get('product');
    if(pid){
      const prod = products.find(p => p.id === pid);
      if(prod) showSingleProductPage(prod);
      else {
        // try to fetch directly
        const doc = await db.collection('products').doc(pid).get();
        if(doc.exists) showSingleProductPage({ id: doc.id, ...doc.data() });
      }
    }
  }catch(err){
    console.error('Error loading products', err);
    if(noProducts){ noProducts.style.display='block'; noProducts.textContent = 'প্রোডাক্ট লোডে সমস্যা।'; }
  }

  function renderProductsGrid(products){
    if(!grid) return;
    grid.innerHTML = '';
    products.forEach(p=>{
      const card = document.createElement('div');
      card.className = 'product-card';
      card.innerHTML = `
        <img src="${escapeHtml(p.imageUrl||'')}" alt="${escapeHtml(p.product_name||'Product')}">
        <div class="card-body">
          <h4>${escapeHtml(p.product_name||'Unnamed')}</h4>
          <div class="small">${escapeHtml(p.category||'')}</div>
          <div class="price">${escapeHtml(p.price||'0')}৳</div>
          <div class="card-actions">
            <button class="btn view-btn" data-id="${p.id}">বিস্তারিত</button>
            <button class="btn alt add-cart-btn" data-id="${p.id}">Add to cart</button>
          </div>
        </div>
      `;
      grid.appendChild(card);

      card.querySelector('.view-btn').addEventListener('click', ()=> {
        // open single product page (preserve header/footer)
        history.pushState({}, '', '?product=' + p.id);
        showSingleProductPage(p);
      });
      card.querySelector('.add-cart-btn').addEventListener('click', ()=> addToCartFromProduct(p) );
    });
  }

  function openProductModal(p){
    const html = `
      <div style="display:flex;flex-direction:column;gap:10px">
        <img src="${escapeHtml(p.imageUrl||'')}" style="width:100%;max-height:320px;object-fit:cover;border-radius:8px" alt="${escapeHtml(p.product_name)}">
        <h3>${escapeHtml(p.product_name)}</h3>
        <div class="small">SKU: ${escapeHtml(p.sku||'N/A')}</div>
        <div class="price">${escapeHtml(p.price||'0')}৳</div>
        <p>${escapeHtml(p.description||'')}</p>
        <div style="display:flex;gap:8px">
          <button class="btn" id="modal-addcart">Add to cart</button>
          <a class="btn alt" href="https://wa.me/8801778095805?text=${encodeURIComponent('Interested in '+(p.product_name||''))}" target="_blank">WhatsApp</a>
        </div>
      </div>
    `;
    showModal(html,'product-modal');
    setTimeout(()=>{
      const btn = document.getElementById('modal-addcart');
      if(btn) btn.addEventListener('click', ()=>{
        addToCartFromProduct(p);
        closeModal('product-modal');
        alert('Added to cart');
      });
    },50);
  }

  function addToCartFromProduct(p){
    const cart = getCart();
    const idx = cart.findIndex(i=> i.id === p.id);
    if(idx>=0){ cart[idx].qty = (cart[idx].qty||1)+1; }
    else cart.push({ id:p.id, name:p.product_name, price: p.price, imageUrl: p.imageUrl, qty:1 });
    saveCart(cart);
    alert('প্রোডাক্ট কার্টে যুক্ত হয়েছে');
  }

  function renderCartModal(){
    const cart = getCart();
    if(cart.length===0){ showModal('<div style="padding:20px"><h3>আপনার কার্ট খালি</h3></div>','cart-modal'); return; }
    let html = `<h3>Cart</h3><div class="cart-list">`;
    let total=0;
    cart.forEach((it,idx)=>{
      total += (Number(it.price||0) * (it.qty||1));
      html += `<div class="cart-item">
        <img src="${escapeHtml(it.imageUrl||'')}" alt="${escapeHtml(it.name)}">
        <div style="flex:1">
          <div><strong>${escapeHtml(it.name)}</strong></div>
          <div class="small">${escapeHtml(it.price)}৳ x ${escapeHtml(it.qty)}</div>
          <div class="qty-controls" style="margin-top:8px">
            <button class="btn small" data-idx="${idx}" data-op="dec">-</button>
            <button class="btn small" data-idx="${idx}" data-op="inc">+</button>
            <button class="btn alt small" data-idx="${idx}" data-op="rm">Remove</button>
          </div>
        </div>
      </div>`;
    });
    html += `</div><div style="margin-top:12px"><strong>Total: ${total}৳</strong></div>
      <div style="margin-top:12px">
        <button id="checkout-btn" class="btn">Checkout via WhatsApp</button>
      </div>`;
    showModal(html,'cart-modal');

    const cm = document.getElementById('cart-inner');
    if(cm){
      cm.querySelectorAll('button[data-op]').forEach(b=>{
        b.addEventListener('click', ()=>{
          const op = b.dataset.op; const idx = Number(b.dataset.idx);
          const cart = getCart();
          if(op==='inc'){ cart[idx].qty = (cart[idx].qty||1) + 1; saveCart(cart); renderCartModal(); }
          if(op==='dec'){ cart[idx].qty = Math.max(1,(cart[idx].qty||1)-1); saveCart(cart); renderCartModal(); }
          if(op==='rm'){ cart.splice(idx,1); saveCart(cart); renderCartModal(); }
        });
      });
    }
    const checkoutBtn = document.getElementById('checkout-btn');
    if(checkoutBtn){
      checkoutBtn.addEventListener('click', ()=>{
        const cart = getCart();
        if(cart.length===0){ alert('Cart is empty'); return; }
        let msg = 'Order: ';
        cart.forEach(it => { msg += `${it.name} x${it.qty} (${it.price}৳), `; });
        msg += `Total: ${total}৳`;
        window.open(`https://wa.me/8801778095805?text=${encodeURIComponent(msg)}`, '_blank');
      });
    }
  }

  updateCartCount();
}

/* ============ Single Product Page (renders inside main-content, keeps header/footer) ============= */
function showSingleProductPage(p){
  const main = document.getElementById('main-content');
  if(!main) return;
  // build images array (if multi images stored as CSV in other_images field)
  const other = p.other_images ? (p.other_images.split(',').map(s=>s.trim()).filter(Boolean)) : [];
  const images = [p.imageUrl || '', ...other];

  main.innerHTML = `
    <section class="section">
      <a class="btn alt" id="back-to-home" href="index.html">&larr; সকল পণ্য দেখুন</a>
    </section>
    <section class="section">
      <div class="product-detail-wrap card">
        <div class="product-images">
          <img id="pd-main-img" class="main-img" src="${escapeHtml(images[0]||'')}" alt="${escapeHtml(p.product_name||'')}">
          ${images.length > 1 ? `<div class="thumbnail-row" id="pd-thumbs">
            ${images.map((img,i)=>`<img class="${i===0?'active':''}" src="${escapeHtml(img)}" data-src="${escapeHtml(img)}" alt="thumb-${i+1}">`).join('')}
          </div>` : ''}
        </div>
        <div class="product-info">
          <h2 class="product-title">${escapeHtml(p.product_name||'')}</h2>
          <div class="product-meta">
            <div><strong>SKU:</strong> <span>${escapeHtml(p.sku||'N/A')}</span></div>
            <div><strong>Category:</strong> <span>${escapeHtml(p.category||'')}</span></div>
            <div><strong>Price:</strong> <span class="price">${escapeHtml(p.price||'0')}৳</span></div>
          </div>

          <div class="variant-selector">
            <label class="small">Variant / Size</label>
            <div class="variant-options" id="pd-variants">
              <!-- variants inserted dynamically if exist -->
            </div>
          </div>

          <div style="margin-top:8px;">
            <label class="small">Quantity</label>
            <div class="quantity-controls">
              <button class="btn small" id="pd-qty-dec">-</button>
              <input id="pd-qty" type="number" value="1" min="1">
              <button class="btn small" id="pd-qty-inc">+</button>
            </div>
          </div>

          <div style="margin-top:12px;display:flex;gap:8px;flex-wrap:wrap">
            <button class="btn" id="pd-whatsapp"><i class="fab fa-whatsapp"></i> Whatsapp Order</button>
            <a class="btn alt" id="pd-messenger" href="#" target="_blank"><i class="fab fa-facebook-messenger"></i> Messenger</a>
          </div>

          <div style="margin-top:12px;">
            <h3 class="small">বিবরণ</h3>
            <div>${escapeHtml(p.description||'বিবরণ পাওয়া যায়নি।')}</div>
          </div>
        </div>
      </div>
    </section>
  `;

  // thumbnails click
  const thumbs = document.querySelectorAll('#pd-thumbs img');
  thumbs.forEach(t=>{
    t.addEventListener('click', (e)=>{
      document.getElementById('pd-main-img').src = e.currentTarget.dataset.src;
      thumbs.forEach(x=>x.classList.remove('active'));
      e.currentTarget.classList.add('active');
    });
  });

  // variants: check if stored in p.variants as CSV
  const pdVariantsWrap = document.getElementById('pd-variants');
  if(pdVariantsWrap){
    const variants = p.variants ? p.variants.split(',').map(s=>s.trim()).filter(Boolean) : [];
    if(variants.length){
      pdVariantsWrap.innerHTML = variants.map((v,i)=>`<div class="variant-option" data-val="${escapeHtml(v)}">${escapeHtml(v)}</div>`).join('');
      // click handlers
      $$('.variant-option', pdVariantsWrap).forEach(o=>{
        o.addEventListener('click', ()=>{ $$('.variant-option', pdVariantsWrap).forEach(x=>x.classList.remove('selected')); o.classList.add('selected'); });
      });
    }
  }

  // qty controls
  const qtyInput = document.getElementById('pd-qty');
  document.getElementById('pd-qty-inc').addEventListener('click', ()=> qtyInput.value = Number(qtyInput.value||1) + 1);
  document.getElementById('pd-qty-dec').addEventListener('click', ()=> qtyInput.value = Math.max(1, Number(qtyInput.value||1) - 1));

  // whatsapp button
  document.getElementById('pd-whatsapp').addEventListener('click', ()=>{
    const sel = document.querySelector('#pd-variants .variant-option.selected')?.dataset.val || '';
    const qty = qtyInput.value || 1;
    const msg = `Hi, I want to order: ${p.product_name} (PCODE: ${p.sku || 'N/A'}), Size: ${sel || 'N/A'}, Qty: ${qty}. Link: ${location.href}`;
    window.open(`https://wa.me/8801778095805?text=${encodeURIComponent(msg)}`, '_blank');
  });

  // messenger link: open m.me with message
  const messengerLink = document.getElementById('pd-messenger');
  messengerLink.href = `https://m.me/61578353266944?text=${encodeURIComponent('I want to order: ' + p.product_name)}`;

  // back button: remove product param and show home view again
  const backBtn = document.getElementById('back-to-home');
  if(backBtn){
    backBtn.addEventListener('click', (e)=>{
      e.preventDefault();
      history.replaceState({}, '', 'index.html');
      // re-render home products (go back)
      location.href = 'index.html';
    });
  }
}

/* ============ ADMIN (a bit simplified) ============= */
async function initAdminPage(){
  const loginForm = $('#login-form');
  const loginEmail = $('#login-email');
  const loginPassword = $('#login-password');
  const adminSection = $('#admin-panel-section');
  const loginSection = $('#admin-login-section');
  const signoutBtn = $('#btn-signout');

  const productForm = $('#product-form');
  const productsList = $('#admin-products-list');
  const clearBtn = $('#btn-clear-form');

  // basic register UI skip here (if needed use previous admin.html + code)
  auth.onAuthStateChanged(user=>{
    if(user){
      if(loginSection) loginSection.style.display = 'none';
      if(adminSection) adminSection.style.display = 'block';
      if(signoutBtn) signoutBtn.style.display = 'inline-block';
      loadAdminProducts();
    } else {
      if(loginSection) loginSection.style.display = 'block';
      if(adminSection) adminSection.style.display = 'none';
      if(signoutBtn) signoutBtn.style.display = 'none';
    }
  });

  if(loginForm){
    loginForm.addEventListener('submit', async (e)=>{
      e.preventDefault();
      try{
        await auth.signInWithEmailAndPassword(loginEmail.value.trim(), loginPassword.value);
        alert('লগইন সফল');
        loginForm.reset();
      }catch(err){ console.error(err); alert('লগইন সমস্যা: ' + (err.message || err.code)); }
    });
  }
  if(signoutBtn) signoutBtn.addEventListener('click', ()=> auth.signOut());

  if(productForm){
    productForm.addEventListener('submit', async (e)=>{
      e.preventDefault();
      const name = $('#p-name').value.trim();
      const price = $('#p-price').value.trim();
      const sku = $('#p-sku').value.trim();
      const category = $('#p-category').value.trim();
      const desc = $('#p-desc').value.trim();
      const fileEl = $('#p-image');
      if(!name || !price){ alert('প্রোডাক্ট নাম ও মূল্য দিন'); return; }
      let imageUrl = '';
      if(fileEl && fileEl.files && fileEl.files[0]){ try{ imageUrl = await uploadToCloudinary(fileEl.files[0]); }catch(err){ alert('ছবি আপলোডে সমস্যা: '+err.message); return; } }
      else imageUrl = 'https://via.placeholder.com/600x400?text=No+Image';
      try{
        await db.collection('products').add({ product_name: name, price, sku, category, description: desc, imageUrl, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
        alert('Product saved'); productForm.reset(); loadAdminProducts();
      }catch(err){ console.error(err); alert('Save error: '+err.message); }
    });
  }
  if(clearBtn) clearBtn.addEventListener('click', ()=> productForm.reset());

  async function loadAdminProducts(){
    if(!productsList) return;
    productsList.innerHTML = '<div>Loading...</div>';
    try{
      const snap = await db.collection('products').orderBy('createdAt','desc').get();
      if(snap.empty){ productsList.innerHTML = '<div>No products yet.</div>'; return; }
      const html = snap.docs.map(doc=>{
        const d = doc.data();
        return `<div class="admin-product-row" data-id="${doc.id}">
          <img src="${escapeHtml(d.imageUrl||'')}" alt="${escapeHtml(d.product_name||'')}">
          <div style="flex:1">
            <div><strong>${escapeHtml(d.product_name||'')}</strong></div>
            <div class="small">${escapeHtml(d.price||'')}৳ - ${escapeHtml(d.sku||'')}</div>
            <div class="small">${escapeHtml(d.category||'')}</div>
          </div>
          <div style="display:flex;flex-direction:column;gap:6px">
            <button class="btn admin-edit" data-id="${doc.id}">Edit</button>
            <button class="btn alt admin-delete" data-id="${doc.id}">Delete</button>
          </div>
        </div>`;
      }).join('');
      productsList.innerHTML = html;

      // bind delete
      $$('.admin-delete', productsList).forEach(b=>{
        b.addEventListener('click', async ()=>{
          if(!confirm('Are you sure to delete?')) return;
          const id = b.dataset.id;
          try{ await db.collection('products').doc(id).delete(); alert('Deleted'); loadAdminProducts(); }catch(err){ console.error(err); alert('Delete error: '+err.message); }
        });
      });

      // bind edit
      $$('.admin-edit', productsList).forEach(b=>{
        b.addEventListener('click', async ()=>{
          const id = b.dataset.id;
          const doc = await db.collection('products').doc(id).get();
          if(!doc.exists){ alert('Not found'); return; }
          const d = doc.data();
          $('#p-name').value = d.product_name || '';
          $('#p-price').value = d.price || '';
          $('#p-sku').value = d.sku || '';
          $('#p-category').value = d.category || '';
          $('#p-desc').value = d.description || '';
          if(confirm('Press OK then submit to save changes (you can change image).')){ productForm.dataset.editId = id; window.scrollTo({ top:0, behavior:'smooth' }); }
        });
      });

      // attach submit handler supporting edit
      try{ productForm.removeEventListener('submit', productForm.__submitHandler); }catch(e){}
      const submitHandler = async function(e){
        e.preventDefault();
        const editId = productForm.dataset.editId;
        const name = $('#p-name').value.trim();
        const price = $('#p-price').value.trim();
        const sku = $('#p-sku').value.trim();
        const category = $('#p-category').value.trim();
        const desc = $('#p-desc').value.trim();
        const fileEl = $('#p-image');
        let imageUrl = '';
        if(fileEl && fileEl.files && fileEl.files[0]){ try{ imageUrl = await uploadToCloudinary(fileEl.files[0]); }catch(err){ alert('Upload failed'); return; } }
        try{
          if(editId){
            const toUpdate = { product_name: name, price, sku, category, description: desc };
            if(imageUrl) toUpdate.imageUrl = imageUrl;
            await db.collection('products').doc(editId).update(toUpdate);
            alert('Updated'); delete productForm.dataset.editId;
          } else {
            if(!imageUrl) imageUrl = 'https://via.placeholder.com/600x400?text=No+Image';
            await db.collection('products').add({ product_name: name, price, sku, category, description: desc, imageUrl, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
            alert('Saved');
          }
          productForm.reset(); loadAdminProducts();
        }catch(err){ console.error(err); alert('Save error: '+err.message); }
      };
      productForm.addEventListener('submit', submitHandler);
      productForm.__submitHandler = submitHandler;

    }catch(err){ console.error(err); productsList.innerHTML = '<div>Error loading products. See console.</div>'; }
  }
}

/* ============ Init based on page ============= */
document.addEventListener('DOMContentLoaded', ()=>{
  // small UI init: mobile menu toggle
  const menuToggle = document.getElementById('menu-toggle');
  const mainNav = document.querySelector('.main-nav');
  if(menuToggle) menuToggle.addEventListener('click', ()=> { if(mainNav) mainNav.style.display = (mainNav.style.display === 'flex' ? 'none' : 'flex'); });

  // set copyright year in footer
  const y = new Date().getFullYear();
  const cy = document.getElementById('copy-year');
  if(cy) cy.textContent = y;

  if(page === 'index') initIndexPage();
  if(page === 'admin') initAdminPage();
});
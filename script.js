// Google Sheet থেকে ডাটা আনা
const sheetURL = "https://docs.google.com/spreadsheets/d/1Euf6Rz-fRAjtzVj7aEoxmzxLA7vrfOuAvNjfo-ctDf0/gviz/tq?tqx=out:json";

async function loadProducts() {
  try {
    const res = await fetch(sheetURL);
    const text = await res.text();

    // JSON ডাটা Parse করা
    const jsonData = JSON.parse(text.substr(47).slice(0, -2));
    const rows = jsonData.table.rows;

    let products = rows.map(r => ({
      name: r.c[0]?.v,
      price: r.c[1]?.v,
      description: r.c[2]?.v,
      image: fixImageLink(r.c[3]?.v)
    }));

    displayProducts(products);
  } catch (err) {
    console.error("Error loading products:", err);
  }
}

// Google Drive / GitHub Image Fixer
function fixImageLink(url) {
  if (!url) return "images/product1.jpg";
  if (url.includes("drive.google.com")) {
    const match = url.match(/id=([^&]+)/);
    const fileId = match ? match[1] : null;
    if (fileId) {
      return `https://drive.google.com/uc?id=${fileId}`;
    }
  }
  return url;
}

// Products Show করা
function displayProducts(products) {
  const list = document.getElementById("product-list");
  list.innerHTML = "";

  products.forEach(p => {
    const div = document.createElement("div");
    div.className = "product";

    div.innerHTML = `
      <img src="${p.image}" alt="${p.name}">
      <h3>${p.name}</h3>
      <p>${p.description}</p>
      <p><strong>৳${p.price}</strong></p>
      <button>কিনুন</button>
    `;

    list.appendChild(div);
  });
}

// Run
loadProducts();

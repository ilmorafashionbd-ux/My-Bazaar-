/**************** CONFIG ****************/
// Google Sheet CSV Link
const DATA_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRPm9-h3hnXGp1r7HBXl6qam4_s8v1SNKnp0Xwa-VdrxJXRRaQihnxKl51fIGuLF6I4VLhGRZ0cHAv9/pub?gid=0&single=true&output=csv";

// GitHub Image Base Path
const imageBaseURL = "https://ilmorafashionbd-ux.github.io/My-Bazaar-/images/product%202";

// WhatsApp Number
const WHATSAPP = "8801778095805";

/**************** STATE ****************/
let PRODUCTS = [];

/**************** UTILS ****************/
const el = sel => document.querySelector(sel);
const fmt = n => '৳' + (Number(n) || 0).toLocaleString('bn-BD');
const safe = v => v == null ? '' : String(v);

function setYear() {
  const y1 = el('#yr');
  if (y1) y1.textContent = new Date().getFullYear();
}

function setStatus(msg, ok = true) {
  const s = el('#status');
  if (!s) return;
  s.textContent = msg;
  s.style.background = ok ? '#0b1424' : '#3b0a0a';
  s.style.color = "white";
  s.style.padding = "5px";
  s.style.borderRadius = "5px";
}

/**************** FETCH CSV ****************/
async function fetchProducts() {
  const res = await fetch(DATA_URL);
  const text = await res.text();
  const rows = text.trim().split("\n").map(r => r.split(","));

  const header = rows[0].map(h => h.trim().toLowerCase());
  const nameIdx = header.indexOf("name");
  const priceIdx = header.indexOf("price");
  const descIdx = header.indexOf("description");
  const imgIdx = header.indexOf("image");

  const list = [];
  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    const name = safe(row[nameIdx]);
    const price = safe(row[priceIdx]);
    const desc = safe(row[descIdx]);
    const imgFile = safe(row[imgIdx]);

    if (!name || !price || !imgFile) continue;

    list.push({
      id: r,
      title: name,
      price: Number(price),
      desc: desc,
      img: imageBaseURL + imgFile
    });
  }
  return list;
}

/**************** RENDER ****************/
function renderGrid() {
  const grid = el('#grid'); if (!grid) return;
  const q = (el('#search')?.value || '').trim().toLowerCase();

  let list = PRODUCTS.filter(p =>
    (q === '' || p.title.toLowerCase().includes(q) || (p.desc || '').toLowerCase().includes(q))
  );

  grid.innerHTML = list.map(p => `
    <article class="card">
      <img class="card-img" loading="lazy" src="${p.img}" alt="${p.title}" />
      <div class="card-body">
        <strong>${p.title}</strong>
        <div class="price">${fmt(p.price)}</div>
        <a class="btn" href="https://wa.me/${WHATSAPP}?text=অর্ডার দিতে চাই:%0A${p.title} - ${fmt(p.price)}">WhatsApp অর্ডার</a>
      </div>
    </article>
  `).join('');
}

/**************** INIT ****************/
(async function init() {
  setYear();
  try {
    PRODUCTS = await fetchProducts();
    setStatus("✅ Google Sheets কানেক্টেড! প্রোডাক্ট লোড হয়েছে।");
    renderGrid();
    el('#search').addEventListener('input', renderGrid);
  } catch (err) {
    console.error(err);
    setStatus("❌ লোড হতে ব্যর্থ: " + err.message, false);
  }
})();
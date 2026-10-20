'use strict';

const PRODUCTS = [
  {
    id: 'apple',
    name: 'Olma',
    category: 'Mevalar',
    unit: 'kg',
    price: 12000,
    cost: 8000,
    image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=700&q=80'
  },
  {
    id: 'potato',
    name: 'Kartoshka',
    category: 'Sabzavotlar',
    unit: 'kg',
    price: 6000,
    cost: 4000,
    image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=700&q=80'
  },
  {
    id: 'banana',
    name: 'Banan',
    category: 'Mevalar',
    unit: 'kg',
    price: 22000,
    cost: 16000,
    image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=700&q=80'
  },
  {
    id: 'greens',
    name: 'Ko‘katlar',
    category: 'Ko‘katlar',
    unit: 'bog‘',
    price: 3000,
    cost: 1500,
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=700&q=80'
  },
  {
    id: 'honey',
    name: 'Asal',
    category: 'Oziq-ovqat',
    unit: 'dona',
    price: 35000,
    cost: 26000,
    image: 'https://images.unsplash.com/photo-1587049352851-8d4e89133924?auto=format&fit=crop&w=700&q=80'
  },
  {
    id: 'milk',
    name: 'Sut',
    category: 'Sut mahsulotlari',
    unit: 'litr',
    price: 10000,
    cost: 7000,
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=700&q=80'
  }
];

const STORAGE_KEY = 'bozorchi_ai_sales_v1';

function money(value) {
  const number = Number(value) || 0;

  return new Intl.NumberFormat('uz-UZ', {
    maximumFractionDigits: 0
  }).format(Math.round(number)) + ' so‘m';
}

function formatQuantity(value) {
  return new Intl.NumberFormat('uz-UZ', {
    maximumFractionDigits: 2
  }).format(Number(value) || 0);
}

function getSales() {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(data) ? data : [];
  } catch (error) {
    return [];
  }
}

function saveSales(sales) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sales));
}

function findProduct(id) {
  return PRODUCTS.find(product => product.id === id) || PRODUCTS[0];
}

function totalRevenue(sales) {
  return sales.reduce((sum, sale) => {
    return sum + Number(sale.total || 0);
  }, 0);
}

function totalProfit(sales) {
  return sales.reduce((sum, sale) => {
    const unitProfit = Number(sale.price || 0) - Number(sale.cost || 0);
    return sum + unitProfit * Number(sale.quantity || 0);
  }, 0);
}

function setText(id, value) {
  const element = document.getElementById(id);

  if (element) {
    element.textContent = value;
  }
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, character => {
    const entities = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    };

    return entities[character];
  });
}

function formatDate(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '—';
  }

  return date.toLocaleString('uz-UZ', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/* BOSH SAHIFA */

function renderHome() {
  const sales = getSales();

  setText('homeRevenue', money(totalRevenue(sales)));
  setText('homeCount', sales.length + ' ta');
  setText('homeProducts', PRODUCTS.length + ' ta');
  setText('homeProfit', money(totalProfit(sales)));
}

/* MAHSULOTLAR */

function renderProducts() {
  const grid = document.getElementById('productGrid');

  if (!grid) return;

  grid.innerHTML = PRODUCTS.map(product => `
    <article class="product-card">
      <img
        src="${product.image}"
        alt="${escapeHTML(product.name)}"
        loading="lazy"
      >
      <div class="product-info">
        <span class="category">${escapeHTML(product.category)}</span>
        <h3>${escapeHTML(product.name)}</h3>
        <p class="muted">O‘lchov: ${escapeHTML(product.unit)}</p>
        <div class="product-bottom">
          <strong>${money(product.price)}</strong>
          <a
            class="small-link"
            href="savdo.html?product=${encodeURIComponent(product.id)}"
          >Sotish →</a>
        </div>
      </div>
    </article>
  `).join('');
}

/* SAVDO FORMASI */

function renderSale() {
  const productSelect = document.getElementById('productSelect');

  if (!productSelect) return;

  productSelect.innerHTML = PRODUCTS.map(product => `
    <option value="${product.id}">
      ${escapeHTML(product.name)} — ${money(product.price)}/${escapeHTML(product.unit)}
    </option>
  `).join('');

  const params = new URLSearchParams(window.location.search);
  const requestedProduct = params.get('product');

  if (PRODUCTS.some(product => product.id === requestedProduct)) {
    productSelect.value = requestedProduct;
  }

  const priceInput = document.getElementById('salePrice');
  const quantityInput = document.getElementById('quantity');
  const saleForm = document.getElementById('saleForm');

  priceInput.value = findProduct(productSelect.value).price;

  function updatePreview() {
    const price = Number(priceInput.value) || 0;
    const quantity = Number(quantityInput.value) || 0;

    setText('totalPreview', money(price * quantity));
  }

  productSelect.addEventListener('change', () => {
    delete priceInput.dataset.edited;
    priceInput.value = findProduct(productSelect.value).price;
    updatePreview();
  });

  priceInput.addEventListener('input', () => {
    priceInput.dataset.edited = '1';
    updatePreview();
  });

  quantityInput.addEventListener('input', updatePreview);

  saleForm.addEventListener('submit', event => {
    event.preventDefault();

    const product = findProduct(productSelect.value);
    const quantity = Number(quantityInput.value);
    const price = Number(priceInput.value);
    const message = document.getElementById('saleMessage');

    if (!Number.isFinite(quantity) || quantity <= 0) {
      setText('saleMessage', 'Miqdorni noldan katta qilib kiriting.');
      return;
    }

    if (!Number.isFinite(price) || price < 0) {
      setText('saleMessage', 'Sotish narxini to‘g‘ri kiriting.');
      return;
    }

    const sales = getSales();

    const newSale = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
      date: new Date().toISOString(),
      productId: product.id,
      name: product.name,
      unit: product.unit,
      quantity: quantity,
      price: price,
      cost: product.cost,
      payment: document.getElementById('payment').value,
      total: quantity * price
    };

    sales.unshift(newSale);

    try {
      saveSales(sales);

      setText(
        'saleMessage',
        '✓ Savdo saqlandi! Hisobot sahifasida natijalarni ko‘rishingiz mumkin.'
      );

      quantityInput.value = '1';
      delete priceInput.dataset.edited;
      priceInput.value = product.price;

      updatePreview();
      renderSaleTables();
      renderHome();
    } catch (error) {
      setText(
        'saleMessage',
        'Saqlash amalga oshmadi. Brauzer xotirasi bloklanmaganini tekshiring.'
      );
    }
  });

  updatePreview();
  renderSaleTables();
}

/* SAVDOLAR JADVALI */

function renderSaleTables() {
  const sales = getSales();

  setText('saleRevenue', money(totalRevenue(sales)));
  setText('saleCount', sales.length + ' ta');

  const tableBody = document.getElementById('recentSales');

  if (!tableBody) return;

  tableBody.innerHTML = sales.slice(0, 8).map(sale => `
    <tr>
      <td>${formatDate(sale.date)}</td>
      <td>${escapeHTML(sale.name)}</td>
      <td>${formatQuantity(sale.quantity)} ${escapeHTML(sale.unit)}</td>
      <td>${escapeHTML(sale.payment)}</td>
      <td>${money(sale.total)}</td>
      <td>
        <button
          class="text-btn"
          type="button"
          data-delete="${escapeHTML(sale.id)}"
        >O‘chirish</button>
      </td>
    </tr>
  `).join('');

  const emptyMessage = document.getElementById('emptySales');

  if (emptyMessage) {
    emptyMessage.hidden = sales.length > 0;
  }

  tableBody.querySelectorAll('[data-delete]').forEach(button => {
    button.addEventListener('click', () => {
      if (!confirm('Ushbu savdoni o‘chirmoqchimisiz?')) return;

      const remainingSales = getSales().filter(
        sale => sale.id !== button.dataset.delete
      );

      saveSales(remainingSales);
      renderSaleTables();
      renderHome();
    });
  });
}

/* HISOBOTLAR */

function renderReport() {
  const sales = getSales();

  setText('reportRevenue', money(totalRevenue(sales)));
  setText('reportProfit', money(totalProfit(sales)));
  setText('reportCount', sales.length + ' ta');

  const productCounts = {};

  sales.forEach(sale => {
    productCounts[sale.name] =
      (productCounts[sale.name] || 0) + Number(sale.quantity || 0);
  });

  const topProduct = Object.entries(productCounts)
    .sort((a, b) => b[1] - a[1])[0];

  setText('topProduct', topProduct ? topProduct[0] : '—');

  const tableBody = document.getElementById('allSales');

  if (tableBody) {
    tableBody.innerHTML = sales.map(sale => {
      const saleProfit =
        (Number(sale.price) - Number(sale.cost)) *
        Number(sale.quantity);

      return `
        <tr>
          <td>${formatDate(sale.date)}</td>
          <td>${escapeHTML(sale.name)}</td>
          <td>${formatQuantity(sale.quantity)} ${escapeHTML(sale.unit)}</td>
          <td>${money(sale.total)}</td>
          <td>${money(saleProfit)}</td>
          <td>${escapeHTML(sale.payment)}</td>
        </tr>
      `;
    }).join('');

    const emptyMessage = document.getElementById('reportEmpty');

    if (emptyMessage) {
      emptyMessage.hidden = sales.length > 0;
    }
  }

  renderWeeklyChart(sales);
}

/* OXIRGI 7 KUN GRAFIGI */

function renderWeeklyChart(sales) {
  const chart = document.getElementById('weeklyChart');

  if (!chart) return;

  const days = [];

  for (let i = 6; i >= 0; i--) {
    const start = new Date();

    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - i);

    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    const dayTotal = sales
      .filter(sale => {
        const saleDate = new Date(sale.date);
        return saleDate >= start && saleDate < end;
      })
      .reduce((sum, sale) => sum + Number(sale.total || 0), 0);

    days.push({
      label: start.toLocaleDateString('uz-UZ', {
        weekday: 'short'
      }),
      value: dayTotal
    });
  }

  const maxValue = Math.max(1, ...days.map(day => day.value));

  chart.innerHTML = days.map(day => {
    const height = Math.max(3, day.value / maxValue * 100);

    return `
      <div class="bar-wrap">
        <strong class="bar-value">
          ${day.value ? money(day.value) : '0'}
        </strong>
        <div
          class="bar"
          style="height:${height}%"
          title="${escapeHTML(day.label)}: ${money(day.value)}"
        ></div>
        <span class="day">${escapeHTML(day.label)}</span>
      </div>
    `;
  }).join('');
}

/* SAYTNI ISHGA TUSHIRISH */

function init() {
  renderHome();
  renderProducts();
  renderSale();
  renderReport();

  const clearButton = document.getElementById('clearSales');

  if (clearButton) {
    clearButton.addEventListener('click', () => {
      const confirmed = confirm(
        'Barcha saqlangan savdolar o‘chirilsinmi? Bu amalni qaytarib bo‘lmaydi.'
      );

      if (!confirmed) return;

      saveSales([]);
      renderHome();
      renderReport();
      renderSaleTables();
    });
  }
}

document.addEventListener('DOMContentLoaded', init);
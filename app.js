/* =========================================================
   WishCart — app.js
   Features:
   - 5 product catalog with tags, ratings, discounts
   - Add / Remove from Wishlist (localStorage)
   - Duplicate prevention
   - Wishlist counter badge
   - Toast notifications
   - Mock AI Recommendation Engine
   ========================================================= */

'use strict';

// ─────────────────────────────────────────────────────────────
//  DATA
// ─────────────────────────────────────────────────────────────

const PRODUCTS = [
  {
    id: 'p1',
    name: 'SonicWave Pro Headphones',
    price: 4999,
    originalPrice: 7999,
    image: 'headphones.png',
    category: 'Audio',
    rating: 4.8,
    tags: ['audio', 'wireless', 'premium', 'music', 'noise-cancelling'],
  },
  {
    id: 'p2',
    name: 'NexWatch Smart Watch',
    price: 8499,
    originalPrice: 11999,
    image: 'smartwatch.png',
    category: 'Wearables',
    rating: 4.6,
    tags: ['wearable', 'fitness', 'health', 'smartwatch', 'tech'],
  },
  {
    id: 'p3',
    name: 'UrbanHaul Laptop Backpack',
    price: 2299,
    originalPrice: 3499,
    image: 'backpack.png',
    category: 'Bags',
    rating: 4.5,
    tags: ['bag', 'travel', 'laptop', 'professional', 'accessories'],
  },
  {
    id: 'p4',
    name: 'AuraPods Wireless Earbuds',
    price: 3199,
    originalPrice: 4999,
    image: 'earbuds.png',
    category: 'Audio',
    rating: 4.7,
    tags: ['audio', 'wireless', 'earbuds', 'music', 'compact'],
  },
  {
    id: 'p5',
    name: 'PixelMax Mirrorless Camera',
    price: 54999,
    originalPrice: 69999,
    image: 'camera.png',
    category: 'Photography',
    rating: 4.9,
    tags: ['photography', 'camera', 'professional', 'tech', 'creative'],
  },
];

// Extended catalog for AI recommendations (not shown in the product grid)
const RECOMMENDATION_POOL = [
  {
    id: 'r1',
    name: 'BassBoost Bluetooth Speaker',
    price: 2799,
    originalPrice: 3999,
    image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&q=80',
    category: 'Audio',
    rating: 4.5,
    tags: ['audio', 'wireless', 'music', 'portable', 'speaker'],
  },
  {
    id: 'r2',
    name: 'ZenFit Smart Band',
    price: 1499,
    originalPrice: 2199,
    image: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd6b0?w=400&q=80',
    category: 'Wearables',
    rating: 4.3,
    tags: ['wearable', 'fitness', 'health', 'smartband', 'compact'],
  },
  {
    id: 'r3',
    name: 'SlimCase Laptop Sleeve',
    price: 799,
    originalPrice: 1299,
    image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400&q=80',
    category: 'Bags',
    rating: 4.4,
    tags: ['bag', 'laptop', 'travel', 'accessories', 'minimalist'],
  },
  {
    id: 'r4',
    name: 'Grip Tripod Pro Stand',
    price: 3499,
    originalPrice: 4999,
    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&q=80',
    category: 'Photography',
    rating: 4.6,
    tags: ['photography', 'tripod', 'professional', 'camera', 'accessories'],
  },
  {
    id: 'r5',
    name: 'TurboCharge Wireless Pad',
    price: 1999,
    originalPrice: 2799,
    image: 'https://images.unsplash.com/photo-1618577608401-46f4a95e0e4c?w=400&q=80',
    category: 'Tech',
    rating: 4.5,
    tags: ['tech', 'wireless', 'charger', 'accessories', 'premium'],
  },
  {
    id: 'r6',
    name: 'NoiseFree ANC Earphones',
    price: 1599,
    originalPrice: 2499,
    image: 'https://images.unsplash.com/photo-1558756520-22cfe5d382ca?w=400&q=80',
    category: 'Audio',
    rating: 4.2,
    tags: ['audio', 'wired', 'noise-cancelling', 'music', 'earphones'],
  },
];

// ─────────────────────────────────────────────────────────────
//  STATE
// ─────────────────────────────────────────────────────────────

const LS_KEY = 'wishcart_wishlist';

function loadWishlist() {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY)) || [];
  } catch {
    return [];
  }
}

function saveWishlist(list) {
  localStorage.setItem(LS_KEY, JSON.stringify(list));
}

let wishlist = loadWishlist(); // array of product ids

// ─────────────────────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────────────────────

function formatPrice(p) {
  return '₹' + p.toLocaleString('en-IN');
}

function discountPct(orig, curr) {
  return Math.round(((orig - curr) / orig) * 100);
}

function isWishlisted(id) {
  return wishlist.includes(id);
}

// ─────────────────────────────────────────────────────────────
//  TOAST
// ─────────────────────────────────────────────────────────────

let toastTimer;

function showToast(message, type = 'add') {
  const toast = document.getElementById('toast');
  clearTimeout(toastTimer);

  const icons = { add: '❤️', remove: '💔', info: '✦' };
  toast.className = `toast toast--${type}`;
  toast.innerHTML = `<span>${icons[type] || '✦'}</span> ${message}`;

  // Trigger reflow for re-animation
  void toast.offsetWidth;
  toast.classList.add('toast--show');

  toastTimer = setTimeout(() => {
    toast.classList.remove('toast--show');
  }, 2800);
}

// ─────────────────────────────────────────────────────────────
//  BADGE
// ─────────────────────────────────────────────────────────────

function updateBadge() {
  const badge = document.getElementById('wishlistBadge');
  const count = wishlist.length;
  badge.textContent = count;
  if (count > 0) {
    badge.classList.remove('hidden');
    // Re-trigger pop animation
    badge.classList.remove('badge');
    void badge.offsetWidth;
    badge.classList.add('badge');
  } else {
    badge.classList.add('hidden');
  }
}

// ─────────────────────────────────────────────────────────────
//  CARD BUILDER
// ─────────────────────────────────────────────────────────────

function buildCard(product, isWishlistView = false) {
  const { id, name, price, originalPrice, image, category, rating } = product;
  const inWishlist = isWishlisted(id);
  const disc = discountPct(originalPrice, price);
  const stars = '★'.repeat(Math.round(rating)) + '☆'.repeat(5 - Math.round(rating));

  const card = document.createElement('article');
  card.className = 'product-card';
  card.setAttribute('role', 'listitem');
  card.dataset.id = id;

  card.innerHTML = `
    <div class="product-card__image-wrap">
      <img src="${image}" alt="${name}" loading="lazy" />
      <span class="product-card__tag">${category}</span>
      <span class="product-card__rating">⭐ ${rating}</span>
    </div>
    <div class="product-card__body">
      <h3 class="product-card__name">${name}</h3>
      <div class="product-card__meta">
        <span class="product-card__price">${formatPrice(price)}</span>
        <span class="product-card__original">${formatPrice(originalPrice)}</span>
        <span class="product-card__discount">${disc}% off</span>
      </div>
      ${isWishlistView
        ? `<button
             id="remove-${id}"
             class="btn btn--danger"
             aria-label="Remove ${name} from wishlist"
             onclick="removeFromWishlist('${id}')"
           >🗑️ Remove</button>`
        : `<button
             id="add-${id}"
             class="${'btn btn--primary' + (inWishlist ? ' wishlisted' : '')}"
             aria-label="${inWishlist ? 'Added to wishlist' : 'Add to wishlist'}"
             onclick="toggleWishlist('${id}')"
           >${inWishlist ? '✓ Wishlisted' : '♡ Add to Wishlist'}</button>`
      }
    </div>
  `;
  return card;
}

// ─────────────────────────────────────────────────────────────
//  RENDER PRODUCTS
// ─────────────────────────────────────────────────────────────

function renderProducts() {
  const grid = document.getElementById('productGrid');
  grid.innerHTML = '';
  PRODUCTS.forEach(p => grid.appendChild(buildCard(p, false)));
}

// ─────────────────────────────────────────────────────────────
//  ADD / REMOVE / TOGGLE
// ─────────────────────────────────────────────────────────────

function toggleWishlist(id) {
  if (isWishlisted(id)) {
    removeFromWishlist(id);
  } else {
    addToWishlist(id);
  }
}

function addToWishlist(id) {
  if (isWishlisted(id)) {
    showToast('Already in your wishlist!', 'info');
    return;
  }
  wishlist.push(id);
  saveWishlist(wishlist);

  // Update add button state on product grid
  const btn = document.getElementById(`add-${id}`);
  if (btn) {
    btn.textContent = '✓ Wishlisted';
    btn.classList.add('wishlisted');
    btn.setAttribute('aria-label', 'Added to wishlist');
  }

  const product = PRODUCTS.find(p => p.id === id);
  showToast(`${product.name} added to wishlist!`, 'add');
  updateBadge();
  renderWishlist();
}

function removeFromWishlist(id) {
  wishlist = wishlist.filter(wid => wid !== id);
  saveWishlist(wishlist);

  // Reset add button on product grid if visible
  const btn = document.getElementById(`add-${id}`);
  if (btn) {
    btn.textContent = '♡ Add to Wishlist';
    btn.classList.remove('wishlisted');
    btn.setAttribute('aria-label', 'Add to wishlist');
  }

  const product = [...PRODUCTS, ...RECOMMENDATION_POOL].find(p => p.id === id);
  showToast(`${product ? product.name : 'Item'} removed from wishlist`, 'remove');
  updateBadge();
  renderWishlist();
}

// ─────────────────────────────────────────────────────────────
//  RENDER WISHLIST
// ─────────────────────────────────────────────────────────────

function renderWishlist() {
  const grid  = document.getElementById('wishlistGrid');
  const empty = document.getElementById('wishlistEmpty');
  grid.innerHTML = '';

  const wishlisted = wishlist.map(id =>
    [...PRODUCTS, ...RECOMMENDATION_POOL].find(p => p.id === id)
  ).filter(Boolean);

  if (wishlisted.length === 0) {
    empty.classList.remove('hidden');
    hideAISection();
    return;
  }

  empty.classList.add('hidden');
  wishlisted.forEach(p => grid.appendChild(buildCard(p, true)));
  runAIRecommendations();
}

// ─────────────────────────────────────────────────────────────
//  AI RECOMMENDATION ENGINE  (mock)
// ─────────────────────────────────────────────────────────────

/**
 * Scoring algorithm:
 *  - For each wishlisted product, extract its tags
 *  - Score each pool item by counting tag overlaps (TF-style)
 *  - Items already in wishlist are excluded
 *  - Top 3 by score are shown
 */
function runAIRecommendations() {
  const wishlisted = wishlist
    .map(id => [...PRODUCTS, ...RECOMMENDATION_POOL].find(p => p.id === id))
    .filter(Boolean);

  if (wishlisted.length === 0) { hideAISection(); return; }

  // Collect all tags from wishlist
  const tagFreq = {};
  wishlisted.forEach(p => {
    p.tags.forEach(t => {
      tagFreq[t] = (tagFreq[t] || 0) + 1;
    });
  });

  // Score recommendation pool (exclude already-wishlisted)
  const wishlistIds = new Set(wishlist);
  const scored = RECOMMENDATION_POOL
    .filter(p => !wishlistIds.has(p.id))
    .map(p => {
      const score = p.tags.reduce((s, t) => s + (tagFreq[t] || 0), 0);
      return { product: p, score };
    })
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  if (scored.length === 0) { hideAISection(); return; }

  const aiSection = document.getElementById('aiSection');
  const aiGrid    = document.getElementById('aiGrid');
  aiGrid.innerHTML = '';

  scored.forEach(({ product }) => {
    const wrap = document.createElement('div');
    wrap.className = 'ai-card-wrap';
    wrap.appendChild(buildCard(product, false));
    aiGrid.appendChild(wrap);
  });

  aiSection.classList.remove('hidden');
}

function hideAISection() {
  document.getElementById('aiSection').classList.add('hidden');
}

// ─────────────────────────────────────────────────────────────
//  SECTION NAVIGATION
// ─────────────────────────────────────────────────────────────

function showSection(name) {
  const sections = ['products', 'wishlist'];
  sections.forEach(s => {
    document.getElementById(`${s}Section`).classList.toggle('section--active', s === name);
  });

  document.getElementById('navProducts').classList.toggle('nav-btn--active', name === 'products');
  document.getElementById('navWishlist').classList.toggle('nav-btn--active', name === 'wishlist');

  if (name === 'wishlist') renderWishlist();
}

// ─────────────────────────────────────────────────────────────
//  INIT
// ─────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  renderProducts();
  updateBadge();
  // Pre-render wishlist silently (for badge consistency)
  const wishlistedCount = wishlist.length;
  if (wishlistedCount > 0) {
    showToast(`Welcome back! You have ${wishlistedCount} item${wishlistedCount > 1 ? 's' : ''} in your wishlist.`, 'info');
  }
});

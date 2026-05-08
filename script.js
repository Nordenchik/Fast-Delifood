// Зміна іконки кошика при наведенні
const basketIcon = document.getElementById('basket-icon');
const basketContainer = document.getElementById('basket-container');

if (basketContainer) {
    basketContainer.addEventListener('mouseenter', function() {
        basketIcon.src = 'images/панель/hovered_basket.png';
    });
    
    basketContainer.addEventListener('mouseleave', function() {
        basketIcon.src = 'images/панель/basket.png';
    });
}

const CART_STORAGE_KEY = 'fastdelifood_cart';

function getCartItems() {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
}

function saveCartItems(items) {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
}

function formatPrice(value) {
    return `${value} грн`;
}

function calculateCartTotal(items) {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

function updateCartBadge() {
    const badge = document.getElementById('cart-badge');
    const items = getCartItems();
    const totalQty = items.reduce((sum, item) => sum + item.quantity, 0);

    if (!badge) return;
    badge.textContent = totalQty;
    badge.style.display = totalQty > 0 ? 'inline-flex' : 'none';
}

function renderCart() {
    const cartItemsWrapper = document.getElementById('cart-items');
    const totalEl = document.getElementById('cart-total');
    const emptyMessage = document.getElementById('cart-empty-message');
    const checkoutBtn = document.getElementById('checkout-btn');
    const items = getCartItems();

    if (!cartItemsWrapper || !totalEl || !emptyMessage || !checkoutBtn) return;

    cartItemsWrapper.innerHTML = '';

    if (!items.length) {
        emptyMessage.style.display = 'block';
        totalEl.textContent = '0 грн';
        checkoutBtn.disabled = true;
        return;
    }

    emptyMessage.style.display = 'none';
    checkoutBtn.disabled = false;

    items.forEach(item => {
        const itemCard = document.createElement('div');
        itemCard.className = 'cart-item';
        itemCard.innerHTML = `
            <div class="cart-item-image">
                <img src="${item.image}" alt="${item.alt || item.title}">
            </div>
            <div class="cart-item-body">
                <p class="cart-item-title">${item.title}</p>
                <p class="cart-item-price">${formatPrice(item.price)} × ${item.quantity}</p>
                <div class="cart-item-controls">
                    <button type="button" class="cart-qty-btn" data-action="decrease" data-id="${item.id}">-</button>
                    <span class="cart-qty">${item.quantity}</span>
                    <button type="button" class="cart-qty-btn" data-action="increase" data-id="${item.id}">+</button>
                    <button type="button" class="cart-remove-btn" data-id="${item.id}">Видалити</button>
                </div>
            </div>
        `;
        cartItemsWrapper.appendChild(itemCard);
    });

    totalEl.textContent = formatPrice(calculateCartTotal(items));
}

function addItemToCart(product) {
    const items = getCartItems();
    const existing = items.find(item => item.id === product.id);

    if (existing) {
        existing.quantity += 1;
    } else {
        items.push({ ...product, quantity: 1 });
    }

    saveCartItems(items);
    renderCart();
    updateCartBadge();
}

function removeCartItem(id) {
    let items = getCartItems();
    items = items.filter(item => item.id !== id);
    saveCartItems(items);
    renderCart();
    updateCartBadge();
}

function updateCartItemQuantity(id, delta) {
    const items = getCartItems();
    const item = items.find(product => product.id === id);

    if (!item) return;

    item.quantity += delta;
    if (item.quantity <= 0) {
        removeCartItem(id);
        return;
    }

    saveCartItems(items);
    renderCart();
    updateCartBadge();
}

function toggleCartPanel(show) {
    const overlay = document.getElementById('cart-overlay');
    const panel = document.getElementById('cart-panel');

    if (!panel || !overlay) return;

    const isOpen = typeof show === 'boolean' ? show : !panel.classList.contains('open');
    panel.classList.toggle('open', isOpen);
    overlay.classList.toggle('open', isOpen);
    document.body.classList.toggle('cart-open', isOpen);
}

function initCartActions() {
    const addButtons = document.querySelectorAll('.menu-card .btn-purple');
    const basket = document.getElementById('basket-container');
    const closeBtn = document.getElementById('cart-close-btn');
    const overlay = document.getElementById('cart-overlay');
    const checkoutBtn = document.getElementById('checkout-btn');
    const cartItemsWrapper = document.getElementById('cart-items');

    addButtons.forEach(button => {
        button.addEventListener('click', function(event) {
            event.preventDefault();
            const card = this.closest('.menu-card');
            const titleEl = card.querySelector('span.fs-5');
            const priceEl = card.querySelector('.product-price');
            const imgEl = card.querySelector('img');

            const title = titleEl ? titleEl.textContent.trim() : 'Товар';
            const price = priceEl ? parseInt(priceEl.textContent.replace(/[^\\d]/g, '')) : 0;
            const id = title.toLowerCase().replace(/\s+/g, '_');

            addItemToCart({
                id,
                title,
                price,
                image: imgEl ? imgEl.src : '',
                alt: imgEl ? imgEl.alt : title
            });
            toggleCartPanel(true);
        });
    });

    if (basket) {
        basket.addEventListener('click', function(event) {
            event.preventDefault();
            toggleCartPanel(true);
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', () => toggleCartPanel(false));
    }

    if (overlay) {
        overlay.addEventListener('click', () => toggleCartPanel(false));
    }

    if (cartItemsWrapper) {
        cartItemsWrapper.addEventListener('click', function(event) {
            const button = event.target.closest('button');
            if (!button) return;

            const itemId = button.dataset.id;
            if (button.classList.contains('cart-remove-btn')) {
                removeCartItem(itemId);
            }

            if (button.classList.contains('cart-qty-btn')) {
                const delta = button.dataset.action === 'increase' ? 1 : -1;
                updateCartItemQuantity(itemId, delta);
            }
        });
    }

    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function() {
            saveCartItems([]);
            renderCart();
            updateCartBadge();
            toggleCartPanel(false);
            alert('Дякуємо! Ваше замовлення оформлено.');
        });
    }
}

function initCart() {
    initCartActions();
    renderCart();
    updateCartBadge();
}

// ===== ВІДГУКИ =====
const DEFAULT_REVIEWS = [
    {
        id: 'default_1',
        name: 'kriper2004',
        rating: 5,
        text: 'Чудовий ресторан! Страви дуже смачні та свіжі, подача гарна. Персонал привітний і швидко обслуговує. Атмосфера затишна, хочеться повернутися ще раз. Рекомендую всім!',
        date: '12 квітня 2025',
        avatarColor: '#e67e22'
    },
    {
        id: 'default_2',
        name: 'nicerizz6769',
        rating: 4,
        text: "Нам дуже сподобався цей ресторан. Меню різноманітне, кожен знайде щось для себе. Їжа була смачна, а порції доволі великі. Приємна музика і гарний інтер'єр створюють гарний настрій.",
        date: '3 березня 2025',
        avatarColor: '#2980b9'
    },
    {
        id: 'default_3',
        name: 'joker_pashalko',
        rating: 2,
        text: 'На жаль, враження від ресторану залишилися не дуже хороші. Довелося довго чекати на замовлення, а їжа була не такою смачною, як очікувалося. Також у залі було досить шумно. Сподіваюся, що з часом сервіс покращиться.',
        date: '18 лютого 2025',
        avatarColor: '#2c2c2c'
    }
];

const REVIEWS_PER_PAGE = 3;
let showAllReviews = false;

function getStoredReviews() {
    const stored = localStorage.getItem('fastdelifood_reviews');
    return stored ? JSON.parse(stored) : [];
}

function saveReviews(reviews) {
    localStorage.setItem('fastdelifood_reviews', JSON.stringify(reviews));
}

// Захист від XSS
function escapeHtml(text) {
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function renderStars(rating) {
    let html = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= rating) {
            html += '<span class="star-filled">★</span>';
        } else {
            html += '<span class="star-empty">★</span>';
        }
    }
    return html;
}

function getInitial(name) {
    return name.trim().charAt(0).toUpperCase();
}

function getAvatarColor(name) {
    const colors = ['#9c4fd1', '#6b4fc8', '#e67e22', '#2980b9', '#27ae60', '#e74c3c', '#16a085'];
    let hash = 0;
    for (let ch of name) hash = (hash << 5) - hash + ch.charCodeAt(0);
    return colors[Math.abs(hash) % colors.length];
}

function formatDate(date) {
    const months = ['січня','лютого','березня','квітня','травня','червня',
                    'липня','серпня','вересня','жовтня','листопада','грудня'];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

function createReviewCard(review, isDeletable) {
    const card = document.createElement('div');
    card.className = 'review-card';
    card.dataset.id = review.id;

    const color = review.avatarColor || getAvatarColor(review.name);
    const initial = getInitial(review.name);

    card.innerHTML = `
        <div class="review-card-header">
            <div class="review-card-avatar" style="background-color:${color};">${escapeHtml(initial)}</div>
            <div class="review-card-info">
                <p class="review-card-name">${escapeHtml(review.name)}</p>
                <div class="review-card-stars">${renderStars(review.rating)}</div>
            </div>
            <div class="review-card-menu" title="${isDeletable ? 'Видалити' : ''}">⋮
                ${isDeletable ? `<div class="review-delete-menu" style="display:none;">
                    <button data-delete="${review.id}">🗑 Видалити</button>
                </div>` : ''}
            </div>
        </div>
        <p class="review-card-text">${escapeHtml(review.text)}</p>
        <p class="review-card-date">${escapeHtml(review.date || '')}</p>
    `;

    if (isDeletable) {
        const menuBtn = card.querySelector('.review-card-menu');
        const deleteMenu = card.querySelector('.review-delete-menu');
        const deleteBtn = card.querySelector('[data-delete]');

        menuBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            const isOpen = deleteMenu.style.display === 'block';
            document.querySelectorAll('.review-delete-menu').forEach(m => m.style.display = 'none');
            deleteMenu.style.display = isOpen ? 'none' : 'block';
        });

        deleteBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            const id = this.dataset.delete;
            const updated = getStoredReviews().filter(r => r.id !== id);
            saveReviews(updated);
            renderReviews();
        });
    }

    return card;
}

function renderReviews() {
    const list = document.getElementById('reviews-list');
    const loadMoreWrapper = document.getElementById('load-more-wrapper');
    if (!list) return;

    list.innerHTML = '';

    const userReviews = getStoredReviews();
    const allReviews = [...userReviews, ...DEFAULT_REVIEWS];
    const toShow = showAllReviews ? allReviews : allReviews.slice(0, REVIEWS_PER_PAGE);

    toShow.forEach(review => {
        const isUserReview = userReviews.some(r => r.id === review.id);
        list.appendChild(createReviewCard(review, isUserReview));
    });

    if (loadMoreWrapper) {
        loadMoreWrapper.style.display = (allReviews.length > REVIEWS_PER_PAGE && !showAllReviews) ? 'block' : 'none';
    }
}

function initStarRating() {
    const stars = document.querySelectorAll('.star-input');
    const starsInput = document.getElementById('review-stars-input');
    if (!starsInput) return;

    let selectedRating = 0;

    stars.forEach(star => {
        star.addEventListener('mouseover', function() {
            const val = parseInt(this.dataset.value);
            stars.forEach(s => {
                const sv = parseInt(s.dataset.value);
                s.classList.toggle('hovered', sv <= val);
                s.classList.remove('active');
            });
        });

        star.addEventListener('mouseleave', function() {
            stars.forEach(s => {
                s.classList.remove('hovered');
                s.classList.toggle('active', parseInt(s.dataset.value) <= selectedRating);
            });
        });

        star.addEventListener('click', function() {
            selectedRating = parseInt(this.dataset.value);
            starsInput.dataset.rating = selectedRating;
            stars.forEach(s => {
                s.classList.remove('hovered');
                s.classList.toggle('active', parseInt(s.dataset.value) <= selectedRating);
            });
        });
    });
}

function initReviewSubmit() {
    const btn = document.getElementById('submit-review-btn');
    if (!btn) return;

    btn.addEventListener('click', function() {
        const nameEl  = document.getElementById('review-name');
        const textEl  = document.getElementById('review-text');
        const starsEl = document.getElementById('review-stars-input');

        const name   = nameEl.value.trim();
        const text   = textEl.value.trim();
        const rating = parseInt(starsEl.dataset.rating || '0');

        if (!name) {
            nameEl.focus();
            nameEl.style.outline = '2px solid #e74c3c';
            setTimeout(() => nameEl.style.outline = '', 1500);
            return;
        }
        if (rating === 0) {
            starsEl.style.outline = '2px solid #e74c3c';
            starsEl.style.borderRadius = '6px';
            setTimeout(() => { starsEl.style.outline = ''; starsEl.style.borderRadius = ''; }, 1500);
            return;
        }
        if (!text) {
            textEl.focus();
            textEl.style.outline = '2px solid #e74c3c';
            setTimeout(() => textEl.style.outline = '', 1500);
            return;
        }

        const newReview = {
            id: 'user_' + Date.now(),
            name: name,
            rating: rating,
            text: text,
            date: formatDate(new Date()),
            avatarColor: getAvatarColor(name)
        };

        const reviews = getStoredReviews();
        reviews.unshift(newReview);
        saveReviews(reviews);

        nameEl.value = '';
        textEl.value = '';
        starsEl.dataset.rating = '0';
        document.querySelectorAll('.star-input').forEach(s => s.classList.remove('active', 'hovered'));

        showAllReviews = false;
        renderReviews();

        document.getElementById('reviews-list').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
}

function initLoadMore() {
    const btn = document.getElementById('load-more-btn');
    if (!btn) return;
    btn.addEventListener('click', function(e) {
        e.preventDefault();
        showAllReviews = true;
        renderReviews();
    });
}

document.addEventListener('click', function() {
    document.querySelectorAll('.review-delete-menu').forEach(m => m.style.display = 'none');
});

document.addEventListener('DOMContentLoaded', function() {
    initTheme();
    initStarRating();
    initReviewSubmit();
    initLoadMore();
    initFeedbackSubmit();
    initCart();
    renderReviews();
});

// ===== ЗВОРОТНІЙ ЗВ'ЯЗОК =====
function initFeedbackSubmit() {
    const btn = document.getElementById('submit-feedback-btn');
    if (!btn) return;

    btn.addEventListener('click', function() {
        const nameEl = document.getElementById('feedback-name');
        const emailEl = document.getElementById('feedback-email');
        const textEl = document.getElementById('feedback-text');
        const successMsg = document.getElementById('feedback-success');

        const name = nameEl.value.trim();
        const email = emailEl.value.trim();
        const text = textEl.value.trim();

        // Проста валідація
        let isValid = true;

        if (!name) {
            nameEl.style.outline = '2px solid #e74c3c';
            setTimeout(() => nameEl.style.outline = '', 1500);
            isValid = false;
        }

        if (!email || !email.includes('@')) {
            emailEl.style.outline = '2px solid #e74c3c';
            setTimeout(() => emailEl.style.outline = '', 1500);
            isValid = false;
        }

        if (!text) {
            textEl.style.outline = '2px solid #e74c3c';
            setTimeout(() => textEl.style.outline = '', 1500);
            isValid = false;
        }

        if (!isValid) return;

        // Імітація успішної відправки
        nameEl.value = '';
        emailEl.value = '';
        textEl.value = '';

        successMsg.style.display = 'block';
        
        // Сховати повідомлення через 4 секунди
        setTimeout(() => {
            successMsg.style.display = 'none';
        }, 4000);
    });
}

// ===== ТЕМНА ТЕМА =====
function initTheme() {
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');

    if (!themeToggle) return;

    // Перевіряємо збережену тему
    const currentTheme = localStorage.getItem('fastdelifood_theme');
    if (currentTheme === 'dark') {
        document.body.classList.add('dark-theme');
        themeIcon.src = 'images/панель/dark_theme.png';
    } else {
        themeIcon.src = 'images/панель/light_theme.png';
    }

    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-theme');
        
        
        if (document.body.classList.contains('dark-theme')) {
            localStorage.setItem('fastdelifood_theme', 'dark');
            themeIcon.src = 'images/панель/dark_theme_hovered.png';
        } else {
            localStorage.setItem('fastdelifood_theme', 'light');
            themeIcon.src = 'images/панель/light_theme_hovered.png';
        }
    });

    // Зміна іконки при наведенні
    themeToggle.addEventListener('mouseenter', () => {
        if (document.body.classList.contains('dark-theme')) {
            themeIcon.src = 'images/панель/dark_theme_hovered.png';
        } else {
            themeIcon.src = 'images/панель/light_theme_hovered.png';
        }
    });

    // Повернення іконки при відведенні курсора
    themeToggle.addEventListener('mouseleave', () => {
        if (document.body.classList.contains('dark-theme')) {
            themeIcon.src = 'images/панель/dark_theme.png';
        } else {
            themeIcon.src = 'images/панель/light_theme.png';
        }
    });
}

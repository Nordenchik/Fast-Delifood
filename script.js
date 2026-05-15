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
                <p class="cart-item-price">Ціна: ${formatPrice(item.price)}</p>
                <p class="cart-item-total">Сума: ${formatPrice(item.price * item.quantity)}</p>
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

function showOrderModal() {
    const modal = document.getElementById('order-modal-overlay');
    if (!modal) return;
    modal.classList.add('open');
}

function hideOrderModal() {
    const modal = document.getElementById('order-modal-overlay');
    if (!modal) return;
    modal.classList.remove('open');
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
            const titleEl = card.querySelector('.product-title, span.fs-5, .fw-bold');
            const priceEl = card.querySelector('.product-price');
            const imgEl = card.querySelector('img');

            const title = titleEl ? titleEl.textContent.trim() : 'Товар';
            const priceText = button.dataset.price || (priceEl ? priceEl.textContent : '0');
            const price = parseInt(priceText.replace(/[^\d]/g, '')) || 0;
            const id = title.toLowerCase().replace(/\s+/g, '_').replace(/[^0-9a-zа-яёєіїґ_]/gi, '');

            addItemToCart({
                id,
                title,
                price,
                image: imgEl ? imgEl.src : '',
                alt: imgEl ? imgEl.alt : title
            });
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
            const items = getCartItems();
            if (!items.length) return;

            saveCartItems([]);
            renderCart();
            updateCartBadge();
            toggleCartPanel(false);
            showOrderModal();
        });
    }

    const orderModal = document.getElementById('order-modal-overlay');
    const orderModalClose = document.getElementById('order-modal-close-btn');
    if (orderModal) {
        orderModal.addEventListener('click', function(event) {
            if (event.target === orderModal) {
                hideOrderModal();
            }
        });
    }
    if (orderModalClose) {
        orderModalClose.addEventListener('click', hideOrderModal);
    }
}

function initCart() {
    initCartActions();
    renderCart();
    updateCartBadge();
}

const MENU_CATEGORIES = [
    {
        key: 'all',
        title: 'Усі',
        items: []
    },
    {
        key: 'бургери',
        title: 'Бургери',
        items: [
            { id: 'cheeseburger', title: 'Чізбургер', price: 145, image: 'images/товари/бургери/cheeseburger.png', description: "Ніжне м'ясо з сиром та соусом у м'якій булочці." },
            { id: 'double_cheeseburger', title: 'Подвійний чізбургер', price: 205, image: 'images/товари/бургери/double cheeseburger.png', description: 'Два смачні котлети та подвійна сирна насолода.' },
            { id: 'chicken_burger', title: 'Курячий бургер', price: 155, image: 'images/товари/бургери/chicken-burger.png', description: 'Соковитий курячий стейк з овочами й ніжним соусом.' },
            { id: 'bacon_burger', title: 'Бургер з беконом', price: 175, image: 'images/товари/бургери/bacon-burger.png', description: 'Хрусткий бекон, смачний сир та справжній бургерний смак.' },
            { id: 'bbq_burger', title: 'BBQ бургер', price: 165, image: 'images/товари/бургери/bbq_burger.png', description: 'Пікантне барбекю з карамелізованою цибулею і соусом.' }
        ]
    },
    {
        key: 'грузинська кухня',
        title: 'Грузинська кухня',
        items: [
            { id: 'khachapuri', title: 'Хачапурі', price: 165, image: 'images/товари/грузинська кухня/khachapuri.png', description: "М'який сир у хрусткій булці — соковито та ситно." },
            { id: 'khinkali', title: 'Хінкалі', price: 155, image: 'images/товари/грузинська кухня/OIP-Photoroom (3).png', description: 'Традиційні грузинські пельмені з пряним бульйоном.' },
            { id: 'chashushuli', title: 'Чашушулі', price: 185, image: 'images/товари/грузинська кухня/R-Photoroom.png', description: "Ніжне тушковане м'ясо в томатному соусі з травами." },
            { id: 'georgian_salad', title: 'Грузинська страва', price: 150, image: 'images/товари/грузинська кухня/istockphoto-1291969896-170667a-Photoroom.png', description: 'Апетитне грузинське частування з пекучим смаком.' }
        ]
    },
    {
        key: 'десерти',
        title: 'Десерти',
        items: [
            { id: 'ice_cream', title: 'Морозиво', price: 95, image: 'images/товари/десерти/ice_cream.png', description: 'Холодний десерт зі свіжим вершковим смаком.' }
        ]
    },
    {
        key: 'м\'ясні вироби',
        title: 'М\'ясні вироби',
        items: [
            { id: 'bujenina', title: 'Буженина', price: 195, image: 'images/товари/м\'ясні вироби/bujenina.png', description: "Соковита м'ясна нарізка з ніжним ароматом спецій." },
            { id: 'chicken_wings', title: 'Курячі крильця', price: 175, image: 'images/товари/м\'ясні вироби/chicken_wings.png', description: 'Пікантні крильця зі спеціями і хрумкою скоринкою.' },
            { id: 'grill_sausages', title: 'Ковбаски на грилі', price: 185, image: 'images/товари/м\'ясні вироби/grill_sausages.png', description: 'Соковиті ковбаски з нотками диму та зелені.' },
            { id: 'kebab', title: 'Шашлик', price: 205, image: 'images/товари/м\'ясні вироби/kebab.png', description: "Апетитні шматочки м'яса на шпажках з овочами." },
            { id: 'steak', title: 'Стейк', price: 235, image: 'images/товари/м\'ясні вироби/steak.png', description: 'Ніжний стейк з правильним обсмаженням та соком.' }
        ]
    },
    {
        key: 'напої',
        title: 'Напої',
        items: [
            { id: 'coca_cola', title: 'Coca-Cola', price: 65, image: 'images/товари/напої/coca_cola.png', description: 'Освіжаючий газований напій для кожного замовлення.' },
            { id: 'fanta', title: 'Fanta', price: 65, image: 'images/товари/напої/fanta.png', description: 'Соковита апельсинова насолода з яскравим смаком.' },
            { id: 'juice', title: 'Сік', price: 75, image: 'images/товари/напої/juice.png', description: 'Свіжий фруктовий сік, що бадьорить з першого ковтка.' },
            { id: 'pepsi', title: 'Pepsi', price: 65, image: 'images/товари/напої/pepsi.png', description: "Класичний газований напій з м'яким смаком." },
            { id: 'sprite', title: 'Sprite', price: 65, image: 'images/товари/напої/sprite.png', description: 'Лимонно-лаймове освіження для жарких днів.' }
        ]
    },
    {
        key: 'снеки',
        title: 'Снеки',
        items: [
            { id: 'cheese_sticks', title: 'Сирні палички', price: 115, image: 'images/товари/снеки/cheese_sticks.png', description: 'Хрусткі сирні роли з тягучою начинкою.' },
            { id: 'fries', title: 'Картопля фрі', price: 105, image: 'images/товари/снеки/fries.png', description: 'Золотава картопля з легкою солончакою посипкою.' },
            { id: 'nachos', title: 'Начос', price: 135, image: 'images/товари/снеки/nachos.png', description: 'Чіпси з сиром, овочами та гострим соусом.' },
            { id: 'nuggets', title: 'Нагетси', price: 135, image: 'images/товари/снеки/nuggets.png', description: 'Соковиті курячі крокети з хрусткою паніровкою.' },
            { id: 'onion_rings', title: 'Цибулеві кільця', price: 125, image: 'images/товари/снеки/onion_rings.png', description: 'Ароматні кільця з ніжною цибулею всередині.' }
        ]
    },
    {
        key: 'торти',
        title: 'Торти',
        items: [
            { id: 'cheesecake', title: 'Чізкейк', price: 145, image: 'images/товари/торти/cheesecake.png', description: 'Ніжний торт із кремовим сирним шаром.' },
            { id: 'chocolate_cake', title: 'Шоколадний торт', price: 155, image: 'images/товари/торти/chocolate_cake.png', description: 'Шоколадний насичений десерт для справжніх гурманів.' },
            { id: 'medovik', title: 'Медовик', price: 150, image: 'images/товари/торти/medovik.png', description: 'Солодкий медовий смак у кожному шматочку.' },
            { id: 'napoleon', title: 'Наполеон', price: 150, image: 'images/товари/торти/napoleon.png', description: 'Слойки з ніжним кремом та хрумким смаком.' }
        ]
    },
    {
        key: 'фастфуд',
        title: 'Фастфуд',
        items: [
            { id: 'hot_dog', title: 'Хот-дог', price: 125, image: 'images/товари/фастфуд/hot_dog.png', description: 'Класичний хот-дог із гірчичним смаком і соусом.' },
            { id: 'pizza', title: 'Піца', price: 220, image: 'images/товари/фастфуд/pizza.png', description: 'Апетитна піца з сиром та ароматними ковбасками.' },
            { id: 'sandwich', title: 'Сендвіч', price: 135, image: 'images/товари/фастфуд/sandwich.png', description: "Ситний сендвіч з овочами та м'ясом всередині." },
            { id: 'shawarma', title: 'Шаурма', price: 165, image: 'images/товари/фастфуд/shawarma.png', description: 'Соковита шаурма з ніжною куркою та салатом.' },
            { id: 'taco', title: 'Тако', price: 145, image: 'images/товари/фастфуд/taco.png', description: "Хрустке тако з пряною м'ясною начинкою." }
        ]
    }
];

function getMenuItems(categoryKey) {
    if (categoryKey === 'all') {
        return MENU_CATEGORIES.reduce((result, category) => {
            if (category.key === 'all') return result;
            return result.concat(category.items);
        }, []);
    }
    const category = MENU_CATEGORIES.find(cat => cat.key === categoryKey);
    return category ? category.items : [];
}

function renderCatalogCategories(activeKey = 'all') {
    const wrapper = document.getElementById('catalog-categories');
    if (!wrapper) return;

    wrapper.innerHTML = MENU_CATEGORIES.map(category => `
        <button type="button" class="btn btn-outline-purple category-tab${category.key === activeKey ? ' active' : ''}" data-category="${category.key}">${category.title}</button>
    `).join('');

    wrapper.querySelectorAll('.category-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            const categoryKey = this.dataset.category;
            renderCatalogItems(categoryKey);
            wrapper.querySelectorAll('.category-tab').forEach(btn => btn.classList.toggle('active', btn.dataset.category === categoryKey));
        });
    });
}

function renderCatalogItems(categoryKey = 'all') {
    const wrapper = document.getElementById('catalog-items');
    if (!wrapper) return;

    const items = getMenuItems(categoryKey);
    if (!items.length) {
        wrapper.innerHTML = '<div class="col"><p class="text-center">Товари не знайдено.</p></div>';
        return;
    }

    wrapper.innerHTML = items.map(item => `
        <div class="col">
            <div class="menu-card rounded-4 p-3 d-flex flex-column">
                <div class="product-image-wrapper mb-3">
                    <img src="${item.image}" alt="${item.title}" class="img-fluid">
                </div>
                <div class="d-flex flex-column flex-grow-1">
                    <h5 class="product-title mb-2">${item.title}</h5>
                    <p class="product-price fw-semibold mb-1">${formatPrice(item.price)}</p>
                    <p class="product-description mb-3">${item.description || 'Смачний товар з нашого меню.'}</p>
                    <button type="button" class="btn btn-purple mt-auto" data-price="${item.price}">Додати до кошика</button>
                </div>
            </div>
        </div>
    `).join('');

    initCartActions();
}

function initMenuCatalog() {
    const hasCatalog = document.getElementById('catalog-items') && document.getElementById('catalog-categories');
    if (!hasCatalog) return;

    renderCatalogCategories('all');
    renderCatalogItems('all');
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
    initMenuCatalog();
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

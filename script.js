// Зміна іконки кошика при наведенні
const basketIcon = document.getElementById('basket-icon');
const basketContainer = document.getElementById('basket-container');

if (basketContainer) {
    basketContainer.addEventListener('mouseenter', function() {
        basketIcon.src = 'images/hovered_basket.png';
    });
    
    basketContainer.addEventListener('mouseleave', function() {
        basketIcon.src = 'images/basket.png';
    });
}

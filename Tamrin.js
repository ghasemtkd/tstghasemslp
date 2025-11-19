document.addEventListener('DOMContentLoaded', function() {
    const menuItems = document.querySelectorAll('.Meno3');
    const floatingProducts = document.getElementById('floatingProducts');
    
    // مخفی کردن محصولات در ابتدا
    floatingProducts.style.display = 'none';
    
    // اضافه کردن رویداد کلیک به هر گزینه منو
    menuItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            // نمایش محصولات با انیمیشن
            floatingProducts.style.display = 'flex';
        });
    });
    
    document.addEventListener('click', function(e) {
        if (!floatingProducts.contains(e.target) && 
            !Array.from(menuItems).some(item => item.contains(e.target))) {
            floatingProducts.style.display = 'none';
        }
    });
});

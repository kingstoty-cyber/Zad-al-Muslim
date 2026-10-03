/* Zad Al-Muslim UI3 — دعم لوحة المفاتيح لشريط التنقل السفلي (إضافة آمنة).
   عناصر التنقل أصبحت role="button" tabindex="0"، وهذا الملف يضيف تفعيلها بمفتاح Enter والمسطرة
   دون المساس بأي معالج نقر قائم. في وضع اللمس لا يتغير أي سلوك. */
(function(){
  'use strict';
  document.addEventListener('keydown', function(event){
    if(event.key !== 'Enter' && event.key !== ' ') return;
    var item = event.target && event.target.closest ? event.target.closest('.bottom-nav .nav-item') : null;
    if(!item) return;
    event.preventDefault();
    item.click();
  });
})();

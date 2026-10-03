/* زاد المسلم v4.9.1 Beta 3 — تبسيط التنقل وصفحة الإعدادات. */
(function () {
  'use strict';

  const moreItems = [
    {icon: 'fa-circle-notch', title: 'المسبحة', description: 'تسبيح سريع مع حفظ العدد', action: "loadTab('tasbeeh')"},
    {icon: 'fa-compass', title: 'القبلة', description: 'معرفة اتجاه القبلة', action: 'renderQibla()'},
    {icon: 'fa-palette', title: 'المظهر', description: 'اختيار الألوان ووضع القراءة', action: "loadTab('themes')"},
    {icon: 'fa-user-gear', title: 'الإعدادات', description: 'التنبيهات والبيانات والخصوصية', action: "loadTab('settings')"},
    {icon: 'fa-download', title: 'التنزيلات', description: 'إدارة التلاوات المحفوظة', action: 'renderAudioDownloads()'},
    {icon: 'fa-android', title: 'تطبيق Android', description: 'تنزيل أحدث نسخة APK', action: 'renderAndroidDownload()'}
  ];

  function renderMore() {
    const content = document.getElementById('page-content');
    if (!content) return;
    content.className = 'fade-in more-page';
    content.innerHTML = `
      <div class="simple-page-heading">
        <i class="fas fa-ellipsis"></i>
        <div><h2>المزيد</h2><p>الأدوات والإعدادات الثانوية في مكان واحد.</p></div>
      </div>
      <div class="more-grid">
        ${moreItems.map(item => `<button class="more-card" onclick="${item.action}">
          <i class="fas ${item.icon}"></i>
          <span><strong>${item.title}</strong><small>${item.description}</small></span>
          <i class="fas fa-chevron-left more-arrow"></i>
        </button>`).join('')}
      </div>`;
  }

  function simplifySettings() {
    const content = document.getElementById('page-content');
    if (!content || AppState.currentTab !== 'settings' || content.querySelector('.settings-sections')) return;
    const heading = content.querySelector('.settings-heading');
    const nodes = [...content.children].filter(node => node !== heading);
    const container = document.createElement('div');
    container.className = 'settings-sections';
    let section = null;

    nodes.forEach(node => {
      if (node.classList.contains('settings-group-title')) {
        section = document.createElement('details');
        section.className = 'settings-section';
        section.innerHTML = `<summary><span>${node.textContent.trim()}</span><i class="fas fa-chevron-down"></i></summary><div class="settings-section-content"></div>`;
        container.appendChild(section);
        node.remove();
        return;
      }
      if (!section) {
        section = document.createElement('details');
        section.className = 'settings-section';
        section.innerHTML = '<summary><span>عام</span><i class="fas fa-chevron-down"></i></summary><div class="settings-section-content"></div>';
        container.appendChild(section);
      }
      section.querySelector('.settings-section-content').appendChild(node);
    });

    const first = container.querySelector('.settings-section');
    if (first) first.open = true;
    content.appendChild(container);
  }

  const baseSettings = window.renderSettings;
  window.renderSettings = function () {
    baseSettings();
    simplifySettings();
  };
  window.renderMore = renderMore;
  window.renderAndroidDownload = function () {
    const content = document.getElementById('page-content');
    if (!content) return;
    content.className = 'fade-in more-page';
    content.innerHTML = `<div class="reader-toolbar"><button onclick="loadTab('more')"><i class="fas fa-arrow-right"></i><span>المزيد</span></button><div><strong>تطبيق زاد المسلم</strong><small>نسخة Android</small></div><span></span></div><section class="card android-download-card"><div class="android-download-icon"><i class="fab fa-android"></i></div><h2>تثبيت التطبيق على Android</h2><p>افتح صفحة البناء الرسمية لتنزيل آخر APK تجريبي بعد نجاح البناء.</p><a class="app-button wide" href="https://github.com/kingstoty-cyber/Zad-al-Muslim/actions/workflows/android-apk.yml" target="_blank" rel="noopener"><i class="fas fa-download"></i> فتح صفحة البناء وتنزيل APK التجريبي</a><small><i class="fas fa-shield-halved"></i> ثبّت النسخ المنشورة من المستودع الرسمي فقط.</small></section>`;
  };
})();

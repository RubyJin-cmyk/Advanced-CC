const galleryBtn = document.getElementById("gallery-toggle");
const main = document.querySelector("main");

if (galleryBtn) {
  galleryBtn.addEventListener("click", () => {
    main.classList.toggle("gallery-grid-mode");
  });
}

// Dark mode button
const toggleButton = document.getElementById("dark-toggle");

// 初始化——读取 localStorage 主题
if (localStorage.getItem('theme') === 'dark') {
  document.body.classList.add('dark');
}

toggleButton.addEventListener('click', () => {
  document.body.classList.toggle('dark');

  // 保存偏好
  if (document.body.classList.contains('dark')) {
    localStorage.setItem('theme', 'dark');
  } else {
    localStorage.setItem('theme', 'light');
  }
});
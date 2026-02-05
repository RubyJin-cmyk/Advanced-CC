// Dark Mode Toggle
const darkToggleBtn = document.getElementById("dark-toggle");
darkToggleBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark");
});

// Gallery Layout Toggle (Timeline ↔ Grid)
const galleryToggleBtn = document.getElementById("gallery-toggle");
const mainEl = document.getElementById("artworks-main");

galleryToggleBtn.addEventListener("click", () => {
  mainEl.classList.toggle("gallery-grid"); // 对应 CSS #artworks-main.gallery-grid
});

// Artwork Hover & Click Highlight
const artworks = document.querySelectorAll(".artwork img");

artworks.forEach(img => {
  // 初始化样式
  img.style.transition = 'transform 0.3s ease, box-shadow 0.3s ease';
  img.style.border = '3px solid rgba(0,0,0,0.2)';
  img.style.borderRadius = '8px';
  img.style.cursor = 'pointer';

  let isHighlighted = false; // 点击高亮状态

  img.addEventListener('mouseover', () => {
    img.style.transform = 'scale(1.03)';
    if (!isHighlighted) {
      img.style.boxShadow = '0 10px 20px rgba(0,0,0,0.2)';
    }
  });

  img.addEventListener('mouseout', () => {
    img.style.transform = 'scale(1)';
    if (!isHighlighted) {
      img.style.boxShadow = '0 0 0 transparent';
    }
  });

  img.addEventListener('click', () => {
    isHighlighted = !isHighlighted;
    if (isHighlighted) {
      img.style.boxShadow = '0 0 15px 5px rgba(255,160,0,0.6)';
    } else {
      img.style.boxShadow = '0 10px 20px rgba(0,0,0,0.2)';
    }
  });
});

/* ==============================================
   MAIN.JS
   1) מעבר בין קטגוריות (Fade In)
   2) סאב-קטגוריות וגלילה חלקה
   3) רקע מתחלף בקטגוריות
   4) טיפים נפתחים/נסגרים
================================================ */

// 1) מעבר בין קטגוריות
const pages = document.querySelectorAll('.category-page');
const navLinks = document.querySelectorAll('header nav a');
let currentActiveId = null;

function showCategory(catId) {
  // הסתרה של הקטגוריה הקודמת
  if (currentActiveId && currentActiveId !== catId) {
    const oldPage = document.getElementById(currentActiveId);
    if (oldPage) oldPage.classList.remove('active');
  }
  // הצגת הקטגוריה החדשה
  const newPage = document.getElementById(catId);
  if (newPage) {
    newPage.classList.add('active');
  }
  // עדכון כפתור nav פעיל
  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('data-category') === catId) {
      link.classList.add('active');
    }
  });
  currentActiveId = catId;
}

// קליק על כפתור nav
navLinks.forEach(link => {
  link.addEventListener('click', () => {
    const targetCat = link.getAttribute('data-category');
    showCategory(targetCat);
    // גלילה לראש העמוד
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
});

// ברירת מחדל: הצגת קטגוריה 1
showCategory('cat1');

// 2) סאב-קטגוריות וגלילה חלקה
const subLinks = document.querySelectorAll('.sub-nav a');
subLinks.forEach(slink => {
  slink.addEventListener('click', e => {
    e.preventDefault();
    const targetAnchor = slink.getAttribute('href');
    const anchorEl = document.querySelector(targetAnchor);
    if (anchorEl) {
      window.scrollTo({
        top: anchorEl.offsetTop - 100,
        behavior: 'smooth'
      });
    }
  });
});

// IntersectionObserver כדי לסמן סאב אקטיבי
const allSubSections = document.querySelectorAll('.category-content[id]');
const observerOptions = {
  root: null,
  rootMargin: '0px',
  threshold: 0.3
};
function observerCallback(entries) {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.getAttribute('id');
      const parentPage = entry.target.closest('.category-page');
      if (!parentPage) return;
      const subLinksInPage = parentPage.querySelectorAll('.sub-nav a');
      subLinksInPage.forEach(link => link.classList.remove('active-sub'));
      const activeLink = parentPage.querySelector(`.sub-nav a[href="#${id}"]`);
      if (activeLink) {
        activeLink.classList.add('active-sub');
      }
    }
  });
}
const observer = new IntersectionObserver(observerCallback, observerOptions);
allSubSections.forEach(section => observer.observe(section));

// 3) רקע מתחלף
const bgImages = [
  'sbBG1.webp',
  'sbBG2.webp',
  'sbBG3.webp',
  'sbBG4.webp',
  'sbBG5.webp'
];
let bgIndex = 0;

function randomRange(min, max) {
  return Math.random() * (max - min) + min;
}

function rotateBackgrounds() {
  pages.forEach(page => {
    page.style.backgroundImage = `url('${bgImages[bgIndex]}')`;
  });
  bgIndex = (bgIndex + 1) % bgImages.length;
}

// הגדרה שכל הקטגוריות יקבלו מחלקה של fade-bg
pages.forEach(page => page.classList.add('fade-bg'));

// מעבר רקע רנדומלי כל פרק זמן בין 10ש' ל-25ש'
setInterval(() => {
  rotateBackgrounds();
}, randomRange(10000,25000));
rotateBackgrounds();

// 4) טיפים נפתחים/נסגרים
const tipHeaders = document.querySelectorAll('.tip-header');
tipHeaders.forEach(header => {
  header.addEventListener('click', () => {
    const content = header.nextElementSibling;
    if (content.style.display === 'block') {
      content.style.display = 'none';
    } else {
      content.style.display = 'block';
    }
  });
});

// בחירת הקנבס מה-HTML
const canvas = document.querySelector('#scene');

// יצירת סצנה
const scene = new THREE.Scene();

// יצירת מצלמה
const camera = new THREE.PerspectiveCamera(
  75, // זווית ראייה
  window.innerWidth / window.innerHeight, // יחס רוחב-גובה
  0.1, // מרחק קרוב
  1000 // מרחק רחוק
);

// יצירת רנדרר
const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

// הוספת תאורה בסיסית
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffffff, 1);
camera.add(pointLight);
scene.add(camera);

// משתנים גלובליים
let drops = [];
let targetIndex = 0;
let isAnimating = false;

// פונקציה ליצירת טיפה
function createDrop(position) {
  const geometry = new THREE.SphereGeometry(1, 32, 32);
  const material = new THREE.MeshPhysicalMaterial({
    color: 0x00aaff,
    transparent: true,
    opacity: 0.7,
    roughness: 0.1,
    metalness: 0.5,
    reflectivity: 1,
    clearcoat: 1,
    clearcoatRoughness: 0,
  });
  const drop = new THREE.Mesh(geometry, material);
  drop.position.copy(position);
  scene.add(drop);
  return drop;
}

// יצירת טיפות במרחב
function createDrops() {
  for (let i = 0; i < 5; i++) {
    const position = new THREE.Vector3(
      (Math.random() - 0.5) * 50,
      (Math.random() - 0.5) * 50,
      -i * 50 - 20 // כדי שהטיפות יהיו במרחקים שונים
    );
    const drop = createDrop(position);
    drops.push(drop);
  }
}

// יצירת חלקיקים (כוכבים ברקע)
function createStars() {
  const starsGeometry = new THREE.BufferGeometry();
  const starsCount = 1000;
  const positions = new Float32Array(starsCount * 3);

  for (let i = 0; i < starsCount * 3; i++) {
    positions[i] = (Math.random() - 0.5) * 1000;
  }

  starsGeometry.setAttribute(
    'position',
    new THREE.BufferAttribute(positions, 3)
  );

  const starsMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.5,
  });

  const stars = new THREE.Points(starsGeometry, starsMaterial);
  scene.add(stars);
}

// יצירת אלמנט להצגת המידע
const infoBox = document.getElementById('infoBox');

// פונקציית התנועה לטיפה הבאה
function moveToDrop(index) {
  if (isAnimating) return; // מניעת אנימציות כפולות
  isAnimating = true;

  const targetPosition = drops[index].position.clone();
  targetPosition.z += 10; // מיקום המצלמה קצת לפני הטיפה

  // הגברת אפקט ה-RGB Shift
  gsap.to(effect.uniforms['amount'], {
    duration: 1,
    value: 0.005, // ערך גבוה יותר
    ease: 'power2.in',
  });

  gsap.to(camera.position, {
    duration: 2, // משך האנימציה
    x: targetPosition.x,
    y: targetPosition.y,
    z: targetPosition.z,
    ease: 'power2.inOut',
    onUpdate: render,
    onComplete: () => {
      isAnimating = false;
      // הצגת מידע
      showInfo(index);

      // החזרת האפקט לערך התחלתי
      gsap.to(effect.uniforms['amount'], {
        duration: 1,
        value: 0.001,
        ease: 'power2.out',
      });
    },
  });
}

// פונקציה להצגת המידע
function showInfo(index) {
  const messages = [
    'ברוכים הבאים למסע שלנו!',
    'אודות העסק: כאן נכתוב את הסיפור שלנו.',
    'השירותים שלנו: פירוט השירותים שאנו מציעים.',
    'פורטפוליו: דוגמאות לעבודות קודמות.',
    'צור קשר: נשמח לשמוע מכם!',
    // ניתן להוסיף עוד הודעות בהתאם למספר הטיפות
  ];

  infoBox.textContent = messages[index] || '';
  infoBox.style.display = 'block';

  // הסתרת המידע לאחר מספר שניות (אופציונלי)
  setTimeout(() => {
    infoBox.style.display = 'none';
  }, 5000);
}

// מאזין לגלילת העכבר
window.addEventListener('wheel', (event) => {
  if (isAnimating) return; // מניעת גלילות בזמן אנימציה

  if (event.deltaY > 0) {
    // גלילה למטה - קדימה
    if (targetIndex < drops.length - 1) {
      targetIndex++;
      moveToDrop(targetIndex);
    }
  } else {
    // גלילה למעלה - אחורה
    if (targetIndex > 0) {
      targetIndex--;
      moveToDrop(targetIndex);
    }
  }
});

// התאמת הגודל בעת שינוי גודל החלון
window.addEventListener('resize', () => {
  const width = window.innerWidth;
  const height = window.innerHeight;

  renderer.setSize(width, height);

  camera.aspect = width / height;
  camera.updateProjectionMatrix();
});

// יצירת composer ל-Post-processing
const composer = new THREE.EffectComposer(renderer);
composer.addPass(new THREE.RenderPass(scene, camera));

// הוספת אפקט של RGB Shift
const effect = new THREE.ShaderPass(THREE.RGBShiftShader);
effect.uniforms['amount'].value = 0.001; // ערך התחלתי נמוך
composer.addPass(effect);

// פונקציית האנימציה הראשית
function animate() {
  requestAnimationFrame(animate);

  // ניתן להוסיף כאן אנימציות נוספות

  render();
}

// פונקציית הרינדור
function render() {
  composer.render();
}

// הסרת הכפתור והתחלת האנימציה
const startButton = document.getElementById('startButton');
startButton.addEventListener('click', () => {
  startButton.style.display = 'none';
  animate();
});

// קריאת פונקציות ההתחלה
createDrops();
createStars();
// אין קריאה ל-animate() כאן, האנימציה תתחיל לאחר לחיצה על הכפתור

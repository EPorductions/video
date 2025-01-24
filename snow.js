/* ==============================================
   SNOW.JS - אפקט שלג דו-שכבתי עם Easing לרוח
   משתמש ב-2 קנבסים: #snow-canvas-back, #snow-canvas-front
================================================ */

/* 1) הפניות לקנבס האחורי והקדמי לשלג */
const snowBack = document.getElementById('snow-canvas-back');
const snowCtxBack = snowBack.getContext('2d');
const snowFront = document.getElementById('snow-canvas-front');
const snowCtxFront = snowFront.getContext('2d');

/* 2) התאמת גודל הקנבס לגודל החלון */
function resizeSnowCanvas() {
  snowBack.width = window.innerWidth;
  snowBack.height = window.innerHeight;
  snowFront.width = window.innerWidth;
  snowFront.height = window.innerHeight;
}
window.addEventListener('resize', resizeSnowCanvas);
resizeSnowCanvas();

/* 3) פונקציית עזר ל־Random Range */
function randomRange(min, max) {
  return Math.random() * (max - min) + min;
}

/* 4) משתני השלג והרוח */
let flakesBack = [];
let flakesFront = [];

/* נוסיף מנגנון Easing לרוח:
   globalWind -> הרוח הנוכחית בפועל
   targetWind -> היעד שאליו נרצה להגיע בהדרגה */
let globalWind = { x: 0, y: 0 };
let targetWind = { x: 0, y: 0 };

/* 5) פונקציה ליצירת רוח רנדומלית עם הגבלות כיוון ועוצמה אקספוננציאלית */
function pickNewWind() {
  // 80% מהזמן אין רוח, 20% יש
  const noWindChance = 0.8;
  const r = Math.random();

  if (r < noWindChance) {
    // אין רוח
    targetWind.x = 0;
    targetWind.y = 0;
  } else {
    // זווית בין -60 מעלות ל-60 מעלות
    const angleDeg = randomRange(-60, 60);
    const angle = angleDeg * Math.PI / 180;

    // התפלגות אקספוננציאלית לעוצמה
    const rawExp = -Math.log(Math.random()); // שכיח יותר קטן, נדיר גדול
    let strength = rawExp * 0.1;  // סקייל אפקט: רוב הזמן קטן, לעתים גבוה

    // הגבלת העוצמה המקסימלית ל-0.3 (לפי הקוד שלך)
    if (strength > 0.3) {
      strength = 0.3;
    }

    targetWind.x = Math.cos(angle) * strength;
    targetWind.y = Math.sin(angle) * strength * 0.1; // רכיב Y קטן יותר
  }
}

/* 6) החלפה מהירה של "רוח מטרה" באמצעות setTimeout + randomRange */
function scheduleWindChange() {
  pickNewWind();
  const nextChange = randomRange(4000, 6000); // 4–6 שניות
  setTimeout(scheduleWindChange, nextChange);
}
scheduleWindChange();

/* 7) בכל Frame נעדכן את globalWind לכיוון targetWind בהדרגה (Easing) */
function updateWind() {
  const easeFactor = 0.02; // 0.02 => שינוי עדין
  globalWind.x += (targetWind.x - globalWind.x) * easeFactor;
  globalWind.y += (targetWind.y - globalWind.y) * easeFactor;
}

/* 8) מחלקה לפתית שלג */
class SnowFlake {
  constructor(front = false) {
    this.front = front;

    // מיקום התחלתי אקראי
    const canvasW = front ? snowFront.width : snowBack.width;
    const canvasH = front ? snowFront.height : snowBack.height;

    this.x = randomRange(0, canvasW);
    this.y = randomRange(-canvasH, 0);

    // הגדרת גודל ומהירות
    this.radius = randomRange(front ? 1 : 2, front ? 3 : 5);
    // speedY בין 0.3 ל-0.7 אם front, אחרת 0.3 עד 0.4
    this.speedY = randomRange(0.3, front ? 0.7 : 0.4);
    this.speedX = randomRange(-0.3, 0.3);

    this.settled = false; // האם "התיישב"
  }

  update() {
    if (this.settled) return;

    // השפעת הרוח הגלובלית (בקצב נמוך)
    this.speedX += globalWind.x * 0.01;
    this.speedY += globalWind.y * 0.01;

    this.x += this.speedX;
    this.y += this.speedY;

    // בדיקת גבולות (יציאה => אתחול מעל)
    const canvasW = this.front ? snowFront.width : snowBack.width;
    const canvasH = this.front ? snowFront.height : snowBack.height;

    if (this.x < 0) this.x = canvasW;
    if (this.x > canvasW) this.x = 0;
    if (this.y > canvasH) {
      this.y = randomRange(-50, 0);
      this.x = randomRange(0, canvasW);
    }
  }

  draw(ctx) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
    ctx.fillStyle = "#FFF";
    ctx.fill();
    ctx.closePath();
  }
}

/* 9) אתחול הפתיתים */
function initSnow() {
  flakesBack = [];
  flakesFront = [];
  // כמות הפתיתים
  for (let i = 0; i < 200; i++) {
    flakesBack.push(new SnowFlake(false));
  }
  for (let j = 0; j < 100; j++) {
    flakesFront.push(new SnowFlake(true));
  }
}

/* 10) לופ אנימציה */
function animateSnow() {
  // עדכון הרוח (Easing)
  updateWind();

  // ניקוי הקנבס
  snowCtxBack.clearRect(0, 0, snowBack.width, snowBack.height);
  snowCtxFront.clearRect(0, 0, snowFront.width, snowFront.height);

  // עדכון וציור פתיתים בשכבה אחורית
  flakesBack.forEach(flake => {
    flake.update();
    flake.draw(snowCtxBack);
  });
  // עדכון וציור פתיתים בשכבה קדמית
  flakesFront.forEach(flake => {
    flake.update();
    flake.draw(snowCtxFront);
  });

  requestAnimationFrame(animateSnow);
}

/* 11) הפעלה */
initSnow();
animateSnow();

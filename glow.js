
/* ==============================================
   GLOW.JS - Glowing Orbs (נצנצים)
   משתמש ב-2 קנבסים: #orb-canvas-back, #orb-canvas-front
   לוקח את גודל החלון (window.innerHeight) ולא scrollHeight
================================================ */

/* 1) הפניות לקנבסים ולקשרי הציור */
const canvasBack = document.getElementById('orb-canvas-back');
const ctxBack = canvasBack.getContext('2d');
const canvasFront = document.getElementById('orb-canvas-front');
const ctxFront = canvasFront.getContext('2d');

/* 2) התאמת גודל הקנבס לגודל החלון */
function resizeOrbCanvas() {
  canvasBack.width = window.innerWidth;
  canvasBack.height = window.innerHeight;

  canvasFront.width = window.innerWidth;
  canvasFront.height = window.innerHeight;
}

window.addEventListener('resize', resizeOrbCanvas);

/* 3) פונקציית עזר */
function randomRange(min, max) {
  return Math.random() * (max - min) + min;
}

/* 4) מחלקה לכדור זוהר יחיד */
class GlowingOrb {
  constructor(front = false) {
    this.front = front;

    // שימוש בקנבס המתאים לגודל
    const cW = this.front ? canvasFront.width : canvasBack.width;
    const cH = this.front ? canvasFront.height : canvasBack.height;

    // מיקום התחלתי רנדומלי על כל המסך
    this.x = randomRange(0, cW);
    this.y = randomRange(0, cH);

    // רדיוס ומהירות תלויות אם הוא קדמי או אחורי
    this.radius = randomRange(front ? 3 : 5, front ? 7 : 12);
    this.speedX = randomRange(-0.08, 0.08);
    this.speedY = randomRange(-0.08, 0.08);

    // צבע רנדומלי (RGBA)
    const rBase = [40, 100];
    const gBase = [80, 180];
    const bBase = [40, 150];
    const r = Math.floor(randomRange(rBase[0], rBase[1]));
    const g = Math.floor(randomRange(gBase[0], gBase[1]));
    const b = Math.floor(randomRange(bBase[0], bBase[1]));
    const alpha = randomRange(0.2, 0.6);
    this.color = rgba(${r}, ${g}, ${b}, ${alpha});
  }

  update() {
    this.x += this.speedX;
    this.y += this.speedY;

    // לולאת קצה לקצה
    const cW = this.front ? canvasFront.width : canvasBack.width;
    const cH = this.front ? canvasFront.height : canvasBack.height;

    if (this.x < -this.radius) {
      this.x = cW + this.radius;
    } else if (this.x > cW + this.radius) {
      this.x = -this.radius;
    }
    if (this.y < -this.radius) {
      this.y = cH + this.radius;
    } else if (this.y > cH + this.radius) {
      this.y = -this.radius;
    }
  }

  draw(ctx) {
    ctx.save();
    ctx.beginPath();
    ctx.shadowBlur = 12;
    ctx.shadowColor = this.color;
    ctx.fillStyle = this.color;
    ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.closePath();
    ctx.restore();
  }
}

/* 5) מערכים לאורבים (אחוריים וקדמיים) */
let orbsBack = [];
let orbsFront = [];

/* 6) אתחול הנצנצים */
function initOrbs() {
  orbsBack = [];
  orbsFront = [];
  // מספר הכדורים בכל שכבה
  for (let i = 0; i < 30; i++) {
    orbsBack.push(new GlowingOrb(false));
  }
  for (let j = 0; j < 20; j++) {
    orbsFront.push(new GlowingOrb(true));
  }
}

/* 7) לופ אנימציה */
function animateOrbs() {
  ctxBack.clearRect(0, 0, canvasBack.width, canvasBack.height);
  ctxFront.clearRect(0, 0, canvasFront.width, canvasFront.height);

  orbsBack.forEach(orb => {
    orb.update();
    orb.draw(ctxBack);
  });
  orbsFront.forEach(orb => {
    orb.update();
    orb.draw(ctxFront);
  });

  requestAnimationFrame(animateOrbs);
}

/* 8) הפעלה */
document.addEventListener('DOMContentLoaded', () => {
  resizeOrbCanvas();
  initOrbs();
  animateOrbs();
});

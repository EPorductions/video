/* ==============================================
   GLOW.JS - Glowing Orbs (נצנצים)
   - משתמש ב-2 קנבסים: #orb-canvas-back, #orb-canvas-front
   - כדי לעבוד במקביל עם השלג, ממקמים אותם "מאחורי" תוכן הדף
================================================ */

const canvasBack = document.getElementById('orb-canvas-back');
const ctxBack = canvasBack.getContext('2d');
const canvasFront = document.getElementById('orb-canvas-front');
const ctxFront = canvasFront.getContext('2d');

/* התאמת גודל ה-canvas לגובה התוכן */
function resizeOrbCanvas() {
  // אפשר להתייחס לגובה ה־page-wrap או לגובה החלון
  // כאן נשתמש בגובה הדף כדי לגלול עם התוכן
  const pageHeight = document.querySelector('.page-wrap').scrollHeight;
  canvasBack.width = window.innerWidth;
  canvasBack.height = pageHeight;
  canvasFront.width = window.innerWidth;
  canvasFront.height = pageHeight;
}
window.addEventListener('resize', resizeOrbCanvas);
document.addEventListener('DOMContentLoaded', resizeOrbCanvas);

function randomRange(min, max) {
  return Math.random() * (max - min) + min;
}

class GlowingOrb {
  constructor(front=false) {
    this.front = front;
    this.x = Math.random() * canvasBack.width;
    this.y = Math.random() * canvasBack.height;
    this.radius = randomRange(front ? 3 : 5, front ? 7 : 12);
    this.speedX = randomRange(-0.08, 0.08);
    this.speedY = randomRange(-0.08, 0.08);

    // צבע רנדומלי
    const rBase = [40,100];
    const gBase = [80,180];
    const bBase = [40,150];
    const r = Math.floor(randomRange(rBase[0], rBase[1]));
    const g = Math.floor(randomRange(gBase[0], gBase[1]));
    const b = Math.floor(randomRange(bBase[0], bBase[1]));
    const alpha = randomRange(0.2, 0.6);
    this.color = `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    // מעברים מחוץ למסך => חזרה מהצד השני (loop)
    if(this.x < -this.radius) {
      this.x = canvasBack.width + this.radius;
    } else if(this.x > canvasBack.width + this.radius) {
      this.x = -this.radius;
    }
    if(this.y < -this.radius) {
      this.y = canvasBack.height + this.radius;
    } else if(this.y > canvasBack.height + this.radius) {
      this.y = -this.radius;
    }
  }

  draw(ctx) {
    ctx.save();
    ctx.beginPath();
    ctx.shadowBlur = 12;
    ctx.shadowColor = this.color;
    ctx.fillStyle = this.color;
    ctx.arc(this.x, this.y, this.radius, 0, 2*Math.PI);
    ctx.fill();
    ctx.closePath();
    ctx.restore();
  }
}

// מערכים של כדורים זוהרים
let orbsBack = [];
let orbsFront = [];

// יצירת כדורים
function initOrbs() {
  orbsBack = [];
  orbsFront = [];
  for(let i=0; i<30; i++){
    orbsBack.push(new GlowingOrb(false));
  }
  for(let j=0; j<20; j++){
    orbsFront.push(new GlowingOrb(true));
  }
}

// אנימציה
function animateOrbs() {
  ctxBack.clearRect(0,0,canvasBack.width, canvasBack.height);
  ctxFront.clearRect(0,0,canvasFront.width, canvasFront.height);

  orbsBack.forEach(o => {
    o.update();
    o.draw(ctxBack);
  });
  orbsFront.forEach(o => {
    o.update();
    o.draw(ctxFront);
  });
  requestAnimationFrame(animateOrbs);
}

// הפעלה
initOrbs();
animateOrbs();

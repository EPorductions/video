/* ==============================================
   SNOW.JS - אפקט שלג דו-שכבתי
   משתמש ב-2 קנבסים: #snow-canvas-back, #snow-canvas-front
   קנבסים אלה מקובעים (position: fixed) כדי שהשלג "ירד" על המסך
================================================ */

const snowBack = document.getElementById('snow-canvas-back');
const snowCtxBack = snowBack.getContext('2d');
const snowFront = document.getElementById('snow-canvas-front');
const snowCtxFront = snowFront.getContext('2d');

function resizeSnowCanvas() {
  snowBack.width = window.innerWidth;
  snowBack.height = window.innerHeight;
  snowFront.width = window.innerWidth;
  snowFront.height = window.innerHeight;
	  console.log("Snow canvas resized");
}
window.addEventListener('resize', resizeSnowCanvas);
resizeSnowCanvas();

/* פונקציית עזר */
function randomRange(min, max) {
  return Math.random() * (max - min) + min;
}

let flakesBack = [];
let flakesFront = [];
let globalWind = { x: 0, y: 0 }; // רוח גלובלית (משתנה מדי פעם)

/* הגדרת רוח רנדומלית */
function randomWind() {
  const angle = Math.random() * 2 * Math.PI; // כיוון אקראי
  const strength = Math.random() * 0.5; // עוצמה עד 0.5px/frame
  globalWind.x = Math.cos(angle) * strength;
  globalWind.y = Math.sin(angle) * strength * 0.2;
}
// שינוי רוח כל כמה שניות אקראיות
setInterval(randomWind, randomRange(2750, 18000));

class SnowFlake {
  constructor(front = false) {
    this.front = front;
    this.x = randomRange(0, snowBack.width);
    this.y = randomRange(-snowBack.height, 0);
    this.radius = randomRange(front ? 1 : 2, front ? 3 : 5);
    this.speedY = randomRange(0.1, front ? 2.0 : 1.0);
    this.speedX = randomRange(-0.3, 0.3);
    this.settled = false;      // האם "התיישב" על הקרקע/כרטיסייה?
    this.settledOnCard = null; // לשימוש מתקדם (אם רוצים שלג 'נצבר' על כרטיסייה...)
  }

  update() {
    // אם כבר "התיישב", לא נעדכן יותר...
    if(this.settled) return;

    // השפעת הרוח
    this.speedX += (globalWind.x * 0.01);
    this.speedY += (globalWind.y * 0.01);

    this.x += this.speedX;
    this.y += this.speedY;

    // יציאה מגבולות המסך => כניסה מהצד השני
    if(this.x < 0) this.x = snowBack.width;
    if(this.x > snowBack.width) this.x = 0;
    if(this.y > snowBack.height) {
      // נעלם למטה => אתחל מחדש מעל המסך
      this.y = randomRange(-50, 0);
      this.x = randomRange(0, snowBack.width);
    }
  }

  draw(ctx) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, 2*Math.PI);
    ctx.fillStyle = "#fff";
    ctx.fill();
    ctx.closePath();
  }
}

console.log("snow.js loaded");

function initSnow() {
  console.log("Initializing snow");
  flakesBack = [];
  flakesFront = [];
  for(let i=0; i<300; i++){
    flakesBack.push(new SnowFlake(false));
  }
  for(let j=0; j<200; j++){
    flakesFront.push(new SnowFlake(true));
  }
  console.log("Snowflakes initialized");
}

function animateSnow() {
  snowCtxBack.clearRect(0,0,snowBack.width, snowBack.height);
  snowCtxFront.clearRect(0,0,snowFront.width, snowFront.height);

  flakesBack.forEach(f => {
    f.update();
    f.draw(snowCtxBack);
  });
  flakesFront.forEach(f => {
    f.update();
    f.draw(snowCtxFront);
  });

  requestAnimationFrame(animateSnow);
}

initSnow();
animateSnow();
randomWind();
console.log("Snow animation started");

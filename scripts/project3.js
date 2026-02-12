const R = 150;
const xh = angle => R / 15.0 * 16 * Math.pow(Math.sin(angle), 3);
const yh = p => R / 15.0 * (
-13 * Math.cos(p) +
5 * Math.cos(2 * p) +
2 * Math.cos(3 * p) +
Math.cos(4 * p)
);

let faceWidth, faceHeight, eyeSize, mouthWidth, mouthHeight;
let r, g, b;

function setup() {
  let canvas = createCanvas(600, 600);
  canvas.parent("sketch-container");
  }

let flowing = false;
let offset = 0;
let timeProgress = 0;

function draw() {
  background(245, 230, 200);

  let cx = width/2;
  let cy = height/2 + 30; // taco 中心
  let w = 400;
  let h = 300;

  //sauce
  if (flowing) {
    stroke(lerpColor(color(200, 30, 30), color(255, 100, 50), timeProgress / 600));
    strokeWeight(12);
    noFill();

    beginShape();
    for (let x = 0; x <= timeProgress; x += 10) {
      let y = height/2 - 20 + sin((x + offset) * 0.05) * 20;
      vertex(x, y);
    }
    endShape();

    offset += 3;
    timeProgress += 3;
    if (timeProgress > width) timeProgress = 0;
  }

  //lettuce
  fill(50, 200, 50);
  noStroke();
  for (let angle = PI; angle <= TWO_PI; angle += PI/12) {
    let x = cx + (w/2) * cos(angle);
    let y = cy + (h/2) * sin(angle);
    ellipse(x, y - 10, 40, 30);
  }

  //tomatoes
  fill(220, 50, 50);
  for (let angle = PI; angle <= TWO_PI; angle += PI/6) {
    let x = cx + (w/2) * cos(angle);
    let y = cy + (h/2) * sin(angle);
    ellipse(x, y - 10, 25, 25);
  }

  //taco shell
  fill(lerpColor(color(255, 204, 100), color(255, 180, 80), timeProgress / 600));
  noStroke();
  arc(cx, cy, w, h, PI, TWO_PI);
}

function keyPressed() {
  flowing = true;
}

function keyReleased() {
  flowing = false;
}
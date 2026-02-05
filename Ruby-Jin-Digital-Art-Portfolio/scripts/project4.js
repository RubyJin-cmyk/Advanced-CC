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
  let canvas = createCanvas(400, 600);
  canvas.parent("sketch-container");
  
  noLoop();
}

function draw() {
  background(240);

  drawLowerBody(200, 480, 1);
  drawUpperBody(200, 300, 1);
  drawHead(200, 120, 1);
}

function drawHead(x, y, s) {
  push();
  translate(x, y + 20);
  scale(s);
  noStroke();

  fill(0, 179, 134);
  ellipse(0, 0, 160, 140);

  fill(255, 214, 51);
  ellipse(-40, 0, 50, 50);
  ellipse(40, 0, 50, 50);

  fill(0);
  beginShape();
  vertex(-42, -20);
  vertex(-35, 0);
  vertex(-42, 20);
  endShape(CLOSE);

  beginShape();
  vertex(42, -20);
  vertex(35, 0);
  vertex(42, 20);
  endShape(CLOSE);

  stroke(0);
  strokeWeight(2);
  noFill();
  beginShape();
  vertex(0, -70);
  quadraticVertex(-10, -90, 0, -100);
  endShape();

  noStroke();
  fill(255, 200, 0, 200);
  ellipse(0, -100, 20, 20);

  pop();
}


function drawUpperBody(x, y, s) {
  push();
  translate(x, y);
  scale(s);
  noStroke();
  fill(115, 0, 153);
  ellipse(0, 30, 250, 270);
  fill(217, 230, 242);
  ellipse(0, 10, 180, 230);
  pop();
}

function drawLowerBody(x, y, s) {
  push();
  translate(x, y);
  scale(s);
  noStroke();
  
  fill(255, 204, 0);
  push();
  translate(-110, 10);
  triangle(100, 102, 20, 100, 60, 20);
  pop();
  
  push();
  translate(-8, 10);
  triangle(100, 102, 20, 100, 60, 20);
  pop();
  
  fill(100, 100, 200);
  ellipse(-50, 10, 70, 120);
  ellipse(50, 10, 70, 120);
  
  pop();
}
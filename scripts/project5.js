const R = 150;
const xh = angle => R / 15.0 * 16 * Math.pow(Math.sin(angle), 3);
const yh = p => R / 15.0 * (
  -13 * Math.cos(p) +
  5 * Math.cos(2 * p) +
  2 * Math.cos(3 * p) +
  Math.cos(4 * p)
);

let points = [
  [260, 100],
  [315, 100],
  [465, 350],
  [435, 400],
  [145, 400],
  [115, 345]
];

let newShape = [
  [265, 160],
  [287, 215],
  [220, 350],
  [465, 350],
  [435, 400],
  [145, 400],
];

let stars = [];
let numStars = 300;
let angleOffset = 0;

function setup() {
  // create the canvas
  let canvas = createCanvas(600, 600);

  // attach the canvas to the div in your HTML
  canvas.parent("sketch-container");
  
  noStroke();
  
  // 初始化星星
  for (let i = 0; i < numStars; i++) {
    stars.push({
      x: random(width),
      y: random(height),
      z: random(0.5, 3), // 深度
      b: random(150, 255), // 亮度
      twinkle: random(TWO_PI)
    });
  }
}

function draw() {
  background(0, 30, 60);
  fill(255);

  for (let i = 0; i < stars.length; i++) {
    let s = stars[i];
    let flicker = sin(frameCount * 0.05 + s.twinkle) * 60;
    let brightness = constrain(s.b + flicker, 100, 255);
    let size = map(s.z, 0.5, 3, 1, 4);
    
    fill(brightness);
    ellipse(s.x, s.y, size);
    
    s.y += s.z * 0.1;
    if (s.y > height) {
      s.y = 0;
      s.x = random(width);
    }
  }

  push();
  translate(width / 2, height / 2);
  rotate(angleOffset);
  translate(-width / 2, -height / 2);
  angleOffset += 0.01;

  stroke(255);
  strokeWeight(2);
  fill(230, 0, 92, 100);
  beginShape();
  for (let i = 0; i < points.length; i++) {
    vertex(points[i][0], points[i][1]);
  }
  endShape(CLOSE);

  fill(100, 200, 150, 150);
  triangle(287, 215, 335, 315, 237, 315);

  fill(150, 150, 250, 150);
  beginShape();
  for (let i = 0; i < newShape.length; i++) {
    vertex(newShape[i][0], newShape[i][1]);
  }
  endShape(CLOSE);

  pop();
}
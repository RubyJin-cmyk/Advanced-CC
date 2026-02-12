const R = 150;
const xh = angle => R / 15.0 * 16 * Math.pow(Math.sin(angle), 3);
const yh = p => R / 15.0 * (
  -13 * Math.cos(p) +
  5 * Math.cos(2 * p) +
  2 * Math.cos(3 * p) +
  Math.cos(4 * p)
);

let sleepHours = [10, 1.5, 6.08, 0.28, 6.67, 19.5, 8.75, 12.33, 9];
let drops = [];
let ripples = [];

function setup() {
  // 创建 canvas
  let canvas = createCanvas(600, 400);
  canvas.parent("sketch-container");

  noStroke();

  // 计算 drops 尺寸
  let minSleep = Math.min(...sleepHours.map(s => sqrt(s)));
  let maxSleep = Math.max(...sleepHours.map(s => sqrt(s)));

  for (let i = 0; i < sleepHours.length; i++) {
    let adjusted = sqrt(sleepHours[i]);
    let size = map(adjusted, minSleep, maxSleep, 20, 40);
    drops.push({
      x: i * 60 + 80,
      y: random(-200, 0),
      size: size,
      speed: random(1, 2),
    });
  }
}

function draw() {
  background(25, 25, 40);


  stroke(50, 100, 200);
  strokeWeight(3);
  for (let i = 0; i <= width; i += 1) {
    let offset = sin(frameCount * 0.05 + i * 0.2) * 3;
    line(i, 300 + offset, i + 10, 300 + sin(frameCount * 0.05 + (i+10)*0.2) * 3);
  }


  for (let d of drops) {
    noStroke();
    fill(150, 200, 255);
    ellipse(d.x, d.y, d.size * 0.001, d.size * 0.7);
    triangle(d.x - d.size * 0.15, d.y - d.size * 0.3, d.x + d.size * 0.15, d.y - d.size * 0.3, d.x, d.y - d.size * 0.8);

    d.y += d.speed;
    if (d.y > 300) {
      // 多层涟漪
      for (let j = 0; j < 3; j++) {
        ripples.push({
          x: d.x,
          y: 300,
          size: d.size + j * 8,
          alpha: 200 - j * 50,
          growth: 0 + j * 2
        });
      }
      d.y = random(-200, 0);
    }
  }


  for (let i = ripples.length - 1; i >= 0; i--) {
    let r = ripples[i];
    noFill();
    stroke(150, 200, 255, r.alpha);
    strokeWeight(2);
    ellipse(r.x, r.y, r.size + r.growth, r.size / 2 + r.growth / 2);
    r.alpha -= 3;
    r.growth += 3;
    if (r.alpha <= 0) ripples.splice(i, 1);
  }
}


function draw() {
  background(25, 25, 40);

  
  stroke(50, 100, 200);
  strokeWeight(3);
  for (let i = 0; i <= width; i += 1) {
    let offset = sin(frameCount * 0.05 + i * 0.2) * 3;
    line(i, 300 + offset, i + 10, 300 + sin(frameCount * 0.05 + (i+10)*0.2) * 3);
  }

  // raindrops
  for (let d of drops) {
    noStroke();
    fill(150, 200, 255);
    ellipse(d.x, d.y, d.size * 0.5, d.size + 9);
    triangle(d.x - d.size * 0.2, d.y - d.size * 0.4, d.x + d.size * 0.2, d.y - d.size * 0.4, d.x, d.y - d.size);

    d.y += d.speed;
    if (d.y > 300) {
      

      for (let j = 0; j < 3; j++) {
        ripples.push({
          x: d.x,
          y: 300,
          size: d.size + j * 8,
          alpha: 200 - j * 50,
          growth: 0 + j * 2
        });
      }
      d.y = random(-200, 0);
    }
  }

  // ripples
  for (let i = ripples.length - 1; i >= 0; i--) {
    let r = ripples[i];
    noFill();
    stroke(150, 200, 255, r.alpha);
    strokeWeight(2);
    ellipse(r.x, r.y, r.size + r.growth, r.size / 2 + r.growth / 2);
    r.alpha -= 3;
    r.growth += 3;
    if (r.alpha <= 0) {
      ripples.splice(i, 1);
    }
  }
}
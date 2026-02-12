const R = 150;
const xh = angle => R / 15.0 * 16 * Math.pow(Math.sin(angle), 3);
const yh = p => R / 15.0 * (
-13 * Math.cos(p) +
5 * Math.cos(2 * p) +
2 * Math.cos(3 * p) +
Math.cos(4 * p)
);


function setup() {

  // create the canvas

  canvas = createCanvas(600, 600);

  // attach the canvas to the div in your HTML

  canvas.parent("sketch-container");

  rectMode(CENTER);
  angleMode(DEGREES);
}

function draw() {
  background(102, 102, 255);
  
  push();
  translate(300,300)
  rotate(90);
  fill(255, 153, 255);
  stroke(153, 0, 204);
  noStroke();
  rect(200,0,300,700);
  pop();
  
  fill(255, 255, 255)
  noStroke();
  rect(30,350,1300,30);
  rect(600,500,20,300);
  rect(500,500,20,300);
  rect(400,500,20,300);
  rect(300,500,20,300);
  rect(200,500,20,300);
  rect(100,500,20,300);
  rect(0,500,20,300);
  
  noStroke();
  fill(120, 70, 20);
  rect(150, 165, 50, 130);
  
  push();
  translate(115,150);
  rotate(-45);
  fill(20, 150, 70);
  ellipse(0, 0, 70, 25);
  pop();
  
  push();
  translate(115,150);
  rotate(45);
  fill(20, 150, 70);
  ellipse(0, 0, 70, 25);
  pop();
  
  push();
  translate(200,130);
  rotate(-45);
  fill(20, 150, 70);
  ellipse(0, 0, 60, 20);
  pop();
  
  push();
  translate(200,130);
  rotate(45);
  fill(20, 150, 70);
  ellipse(0, 0, 60, 20);
  pop();
  
  push();
  blendMode(BURN);
  fill(180, 220, 250, 120);
  stroke(1, 0, 200);
  strokeWeight(3);
  quad(100, 100,
       250, 100,
       195, 230,
       45, 230);
  quad(350, 100,
       500, 100,
       445, 230,
       295, 230);
  pop();
  blendMode(BLEND);
  
  //show coordinates with mouse
  push();
  fill(0);
  text("(" + mouseX + ", " + mouseY + ")", mouseX, mouseY);
  stroke(0);
  pop();

}
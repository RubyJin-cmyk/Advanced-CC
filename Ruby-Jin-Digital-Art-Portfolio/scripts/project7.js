const R = 150;
const xh = angle => R / 15.0 * 16 * Math.pow(Math.sin(angle), 3);
const yh = p => R / 15.0 * (
-13 * Math.cos(p) +
5 * Math.cos(2 * p) +
2 * Math.cos(3 * p) +
Math.cos(4 * p)
);

let scene = 0;
let player;
let enemy;
let choice = "";
let walls = [];
let pg1, pg2, pg3, pg4, pg5, pg6, pg7

function setup() {
  let canvas = createCanvas(600, 400);
  canvas.parent("sketch-container");
  initializeGame();
}

function draw() {
  background(220);

  switch (scene) {
    case 0:
      drawDoctorScene();
      break;
    case 1:
      drawMirrorOrSink();
      break;
    case 2:
      drawChaseScene(); // Scene 3
      break;
    case 3:
      drawFightOrFlee();
      break;
    case 4:
      drawEnding();
      break;
  }
}

function preload() {
  pg1 = loadImage('scenes/1.jpg');
  pg2 = loadImage('scenes/2.jpg');
  pg3 = loadImage('scenes/3.jpg');
  pg4 = loadImage('scenes/4.jpg');
  pg5 = loadImage('scenes/5.jpg');
  pg6 = loadImage('scenes/6.jpg');
  pg7 = loadImage('scenes/7.jpg');
}

// ==========================
// SCENES
// ==========================

function drawDoctorScene() {
  image(pg1, 0, 0, width, height);
  fill(0, 0, 0, 150);
  rect(0, 0, width, 80);

  fill(255);
  textSize(18);
  textAlign(CENTER);
  text("Scene 1: Doctor's Talk", width/2, 30);
  text("Press T to take medicine or F to fake it", width / 2, 60);
}
function drawMirrorOrSink() {
  textSize(18);
  textAlign(CENTER);

  if (choice === "take") {
    image(pg2, 0, 0, width, height);
    fill(0, 0, 0, 150);
    rect(0, 0, width, 80);
    fill(255);
    text("Scene 2: Mirror - your eyes follow the mouse", width / 2, 50);
    ellipse(mouseX, height / 2, 30, 30);
  } 
  else if (choice === "fake") {
    image(pg3, 0, 0, width, height);
    fill(0, 0, 0, 150);
    rect(0, 0, width, 80);
    fill(255);
    text("Scene 2: Sink - click the pill to discard", width / 2, 50);
    fill(150, 0, 0);
    rect(width / 2 - 10, height / 2, 20, 10);
  }

  drawBottomHint("Press SPACE to continue");
}

function drawBottomHint(msg) {
  push();
  let shakeX = random(-1, 1);
  let shakeY = random(-1, 1);
  
  fill(0, 0, 0, 150);
  rect(0, height - 80, width, 80);
  
  fill(255);
  textSize(14);
  textAlign(CENTER);
  text(msg, width / 2 + shakeX, height - 40 + shakeY);
  pop();
}

function drawChaseScene() {
  background(200, 50, 50);
  fill(0);
  textSize(16);
  textAlign(CENTER);
  text("Scene 3: Maze Chase! Reach the right side to escape", width / 2, 30);
  text("Avoid the patient chasing you!", width / 2, 50);

  // draw maze walls
  fill(100);
  for (let w of walls) {
    rect(w.x, w.y, w.w, w.h);
  }

  // display player
  player.display();

  // display enemy
  enemy.display();

  // enemy AI: chase player but stay behind
  enemy.chasePlayer(player, walls);

  // collision detection player-wall
  for (let w of walls) {
    player.collideWall(w);
  }

  // player reached right side → success
  if (player.x > width - 20) {
    scene = 3; // Scene 4: Fight or Flee
  }

  // collision player-enemy → fail
  if (dist(player.x, player.y, enemy.x, enemy.y) < 20) {
    scene = 4;
    choice = "caught";
  }
}

function drawFightOrFlee() {
  image(pg4, 0, 0, width, height);
  
  fill(0, 0, 0, 150);
  rect(0, 0, width, 80);
  
  fill(255);
  textSize(18);
  textAlign(CENTER);

  let shakeX = random(-2, 2);
  let shakeY = random(-2, 2);

  text("Scene 4: Fight (E) or Flee (R)", width / 2 + shakeX, 50 + shakeY);
}

let endingProgress = 0; // 在全局声明

function drawEnding() {
  textAlign(CENTER);

  let msg = "";
  if (choice === "fight") {
    image(pg6, 0, 0, width, height);
    msg = "Ending: You have proven yourself dangerous.";
  } 
  else if (choice === "flee") {
    image(pg7, 0, 0, width, height);
    msg = "Ending: You fled, but your paranoia got the best of you.";
  } 
  else if (choice == "caught") {
    image(pg5, 0, 0, width, height);
    msg = "Ending: You were caught during the chase. Don't let them grind you down.";
  }

  if (endingProgress < msg.length) {
    endingProgress += 0.3;
  }
  let lettersToShow = floor(endingProgress);

  fill(255);
  textSize(18);
  text(msg.substring(0, lettersToShow), width / 2, height / 2);


  if (lettersToShow >= msg.length) {
    let shakeX = random(-1, 1);
    let shakeY = random(-1, 1);
    textSize(14);
    text("Press SPACE to restart", width / 2 + shakeX, height / 2 + 50 + shakeY);
  }
}


// ==========================
// PLAYER AND ENEMY
// ==========================
class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = 20;
    this.speed = 6; // faster
  }

  display() {
    fill(0, 0, 255);
    ellipse(this.x, this.y, this.size);
  }

  move(dx, dy) {
    this.x += dx;
    this.y += dy;
    this.x = constrain(this.x, 0, width);
    this.y = constrain(this.y, 0, height);
  }

  collideWall(w) {
    if (this.x + this.size/2 > w.x && this.x - this.size/2 < w.x + w.w &&
        this.y + this.size/2 > w.y && this.y - this.size/2 < w.y + w.h) {
      if (keyIsDown(LEFT_ARROW)) this.x = w.x + w.w + this.size/2;
      if (keyIsDown(RIGHT_ARROW)) this.x = w.x - this.size/2;
      if (keyIsDown(UP_ARROW)) this.y = w.y + w.h + this.size/2;
      if (keyIsDown(DOWN_ARROW)) this.y = w.y - this.size/2;
    }
  }
}

class Enemy {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = 20;
    this.speed = 3;
  }

  display() {
    fill(255, 0, 0);
    ellipse(this.x, this.y, this.size);
  }

  chasePlayer(player, walls) {
    // only chase if behind player
    if (this.x < player.x - 10) {
      let dx = player.x - this.x;
      let dy = player.y - this.y;
      let distTotal = sqrt(dx*dx + dy*dy);
      if (distTotal > 0) {
        let nextX = this.x + (dx / distTotal) * this.speed;
        let nextY = this.y + (dy / distTotal) * this.speed;
        // check wall collision
        let futureRect = {x: nextX - this.size/2, y: nextY - this.size/2, w: this.size, h: this.size};
        let blocked = false;
        for (let w of walls) {
          if (futureRect.x + futureRect.w > w.x && futureRect.x < w.x + w.w &&
              futureRect.y + futureRect.h > w.y && futureRect.y < w.y + w.h) {
            blocked = true;
            break;
          }
        }
        if (!blocked) {
          this.x = nextX;
          this.y = nextY;
        }
      }
    }
  }
}

// ==========================
// KEYBOARD INPUT
// ==========================
function keyPressed() {
  // Restart
  if (scene === 4 && key === " ") {
    initializeGame();
    return;
  }

  // Scene 0: Doctor
  if (scene === 0) {
    if (key === "T" || key === "t") { choice = "take"; scene = 1; }
    if (key === "F" || key === "f") { choice = "fake"; scene = 1; }
  }

  // Scene 1: Mirror or Sink -> Chase
  if (scene === 1 && key === " ") {
    scene = 2;
  }

  // Scene 3: Fight or Flee
  if (scene === 3) {
    if (key === "E" || key === "e") { choice = "fight"; scene = 4; }
    if (key === "R" || key === "r") { choice = "flee"; scene = 4; }
  }
}

// continuous movement
function drawPlayerMovement() {
  if (scene === 2) {
    if (keyIsDown(LEFT_ARROW)) player.move(-player.speed,0);
    if (keyIsDown(RIGHT_ARROW)) player.move(player.speed,0);
    if (keyIsDown(UP_ARROW)) player.move(0,-player.speed);
    if (keyIsDown(DOWN_ARROW)) player.move(0,player.speed);
  }
}

function draw() {
  background(220);
  drawPlayerMovement();

  switch (scene) {
    case 0: drawDoctorScene(); break;
    case 1: drawMirrorOrSink(); break;
    case 2: drawChaseScene(); break;
    case 3: drawFightOrFlee(); break;
    case 4: drawEnding(); break;
  }
}

// ==========================
// INITIALIZE / RESTART
// ==========================
function initializeGame() {
  scene = 0;
  choice = "";
  player = new Player(20, height/2);
  enemy = new Enemy(50, height/2);

  // simple maze walls
  walls = [
    {x: 150, y: 0, w: 20, h: 250},
    {x: 300, y: 150, w: 20, h: 250},
    {x: 450, y: 0, w: 20, h: 250},
  ];
}